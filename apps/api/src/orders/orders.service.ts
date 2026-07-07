import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { UserRole } from '../auth/roles';
import { FoodItem } from '../menu/entities/food-item.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ORDER_STATUS_RANK, type OrderStatus } from './order-status';
import { CreateOrderDto } from './dto/create-order.dto';
import { MergeOrdersDto } from './dto/merge-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(FoodItem)
    private readonly foodItems: Repository<FoodItem>,
    private readonly notifications: NotificationsService
  ) {}

  async create(ownerId: string, dto: CreateOrderDto): Promise<Order> {
    // Collapse duplicate lines for the same item into a single quantity.
    const quantities = new Map<string, number>();
    for (const line of dto.items) {
      quantities.set(
        line.foodItemId,
        (quantities.get(line.foodItemId) ?? 0) + line.quantity
      );
    }

    const ids = [...quantities.keys()];
    // Only this café's items can be ordered.
    const found = await this.foodItems.find({ where: { id: In(ids), ownerId } });
    const byId = new Map(found.map((f) => [f.id, f]));

    const lines: OrderItem[] = [];
    let total = 0;
    for (const [foodItemId, quantity] of quantities) {
      const food = byId.get(foodItemId);
      if (!food) {
        throw new BadRequestException(`Food item ${foodItemId} not found`);
      }
      if (!food.available) {
        throw new BadRequestException(`"${food.name}" is no longer available`);
      }
      const line = new OrderItem();
      line.foodItemId = food.id;
      line.name = food.name;
      line.price = food.price;
      line.quantity = quantity;
      lines.push(line);
      total += food.price * quantity;
    }

    const order = this.orders.create({
      ownerId,
      tableNumber: dto.tableNumber,
      note: dto.note ?? null,
      status: 'pending',
      total: Math.round(total * 100) / 100,
      items: lines,
    });
    const saved = await this.orders.save(order);

    // Push a real-time notification to the café's admin dashboard(s). Fire and
    // forget — a missing subscriber is a no-op and never affects the response.
    this.notifications.emitToOwner(saved.ownerId, 'order.created', toOrderPayload(saved));

    return saved;
  }

  findAll(
    ownerId: string,
    status?: string,
    tableNumber?: string
  ): Promise<Order[]> {
    return this.orders.find({
      where: {
        ownerId,
        ...(status ? { status: status as OrderStatus } : {}),
        ...(tableNumber ? { tableNumber } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(ownerId: string, id: string): Promise<Order> {
    const order = await this.orders.findOne({ where: { id, ownerId } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  /** Look up an order by id alone — used for public order tracking by the
   *  customer app (the id is an unguessable uuid held on the device). */
  async findByIdPublic(id: string): Promise<Order> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async updateStatus(
    ownerId: string,
    id: string,
    dto: UpdateOrderStatusDto,
    role: UserRole = 'owner'
  ): Promise<Order> {
    // Kitchen staff advance prep status but cannot settle payment — only the
    // owner or a waiter may mark an order paid.
    if (role === 'kitchen' && dto.status === 'paid') {
      throw new ForbiddenException(
        'Kitchen staff cannot mark orders as paid',
      );
    }
    const order = await this.findOne(ownerId, id);
    order.status = dto.status;
    return this.orders.save(order);
  }

  /** Combine several orders from the same table into a single order. The
   *  earliest order is kept (preserving its id/createdAt for tracking); its
   *  siblings' line items are folded in — duplicate dishes collapse into a
   *  summed quantity — and the sources are then deleted. */
  async mergeOrders(ownerId: string, dto: MergeOrdersDto): Promise<Order> {
    const ids = [...new Set(dto.orderIds)];
    if (ids.length < 2) {
      throw new BadRequestException('Select at least two orders to merge.');
    }

    const found = await this.orders.find({
      where: { id: In(ids), ownerId },
      order: { createdAt: 'ASC' },
    });
    if (found.length !== ids.length) {
      throw new NotFoundException('One or more orders could not be found.');
    }

    const tableNumber = found[0].tableNumber;
    if (found.some((o) => o.tableNumber !== tableNumber)) {
      throw new BadRequestException(
        'Only orders from the same table can be merged.'
      );
    }

    // Fold every source's items into the primary, collapsing duplicate dishes.
    const [primary, ...rest] = found;
    const byFood = new Map<string, OrderItem>();
    for (const src of found) {
      for (const line of src.items) {
        const existing = byFood.get(line.foodItemId);
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          const merged = new OrderItem();
          merged.foodItemId = line.foodItemId;
          merged.name = line.name;
          merged.price = line.price;
          merged.quantity = line.quantity;
          byFood.set(line.foodItemId, merged);
        }
      }
    }

    const items = [...byFood.values()];
    const total = items.reduce((sum, l) => sum + l.price * l.quantity, 0);

    // Keep the earliest (least advanced) lifecycle stage among the sources.
    const status = found.reduce<OrderStatus>(
      (best, o) =>
        ORDER_STATUS_RANK[o.status] < ORDER_STATUS_RANK[best] ? o.status : best,
      found[0].status
    );

    const notes = found
      .map((o) => o.note?.trim())
      .filter((n): n is string => !!n);

    primary.items = items;
    primary.total = Math.round(total * 100) / 100;
    primary.status = status;
    primary.note = notes.length ? [...new Set(notes)].join(' • ') : null;

    // Remove the now-merged siblings (their items cascade-delete), then persist
    // the enriched primary. Deleting first frees any collapsed item rows.
    if (rest.length) {
      await this.orders.remove(rest);
    }
    return this.orders.save(primary);
  }
}

/** Shape the order for the notification payload — mirrors OrderDto (no ownerId),
 *  so the admin app can consume it with its existing `Order` type. */
function toOrderPayload(order: Order) {
  return {
    id: order.id,
    tableNumber: order.tableNumber,
    status: order.status,
    note: order.note,
    total: order.total,
    items: order.items.map((i) => ({
      id: i.id,
      foodItemId: i.foodItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
