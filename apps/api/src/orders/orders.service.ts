import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FoodItem } from '../menu/entities/food-item.entity';
import { type OrderStatus } from './order-status';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(FoodItem)
    private readonly foodItems: Repository<FoodItem>
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
    return this.orders.save(order);
  }

  findAll(ownerId: string, status?: string): Promise<Order[]> {
    return this.orders.find({
      where: status ? { ownerId, status: status as OrderStatus } : { ownerId },
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

  async updateStatus(
    ownerId: string,
    id: string,
    dto: UpdateOrderStatusDto
  ): Promise<Order> {
    const order = await this.findOne(ownerId, id);
    order.status = dto.status;
    return this.orders.save(order);
  }
}
