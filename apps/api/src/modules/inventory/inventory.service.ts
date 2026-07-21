import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { InventoryItemDto } from './dto/inventory-item.dto';
import { InventoryLinkDto } from './dto/inventory-link.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { type AdjustmentReason } from './inventory-adjustment-reason';
import { InventoryAdjustment } from './entities/inventory-adjustment.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryLink } from './entities/inventory-link.entity';

/** An order line as far as inventory cares: which dish, how many. */
interface ConsumptionLine {
  foodItemId: string;
  quantity: number;
}

/**
 * Inventory tracking for a café owner. Every query/mutation is scoped to the
 * calling owner so one café can never touch another's stock. Stock is a
 * mutable counter drawn down when an order is marked paid (see the order
 * consumption hooks) and topped up / corrected via manual adjustments.
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly items: Repository<InventoryItem>,
    @InjectRepository(InventoryLink)
    private readonly links: Repository<InventoryLink>,
    @InjectRepository(InventoryAdjustment)
    private readonly adjustments: Repository<InventoryAdjustment>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    const item = this.items.create({
      ownerId,
      name: dto.name.trim(),
      quantity: dto.quantity,
      unit: normalizeText(dto.unit),
      links: toLinkEntities(dto.links),
      lowStockThreshold: dto.lowStockThreshold ?? null,
      note: normalizeText(dto.note),
    });
    await this.items.save(item);
    return toDto(item);
  }

  async findAll(ownerId: string): Promise<InventoryItemDto[]> {
    const items = await this.items.find({
      where: { ownerId },
      order: { name: 'ASC' },
    });
    return items.map(toDto);
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    const item = await this.getOwned(ownerId, id);
    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.unit !== undefined) item.unit = normalizeText(dto.unit);
    if (dto.lowStockThreshold !== undefined)
      item.lowStockThreshold = dto.lowStockThreshold ?? null;
    if (dto.note !== undefined) item.note = normalizeText(dto.note);
    // Replacing the array (with cascade + orphanedRowAction) removes dropped
    // links and inserts new ones in one save.
    if (dto.links !== undefined) item.links = toLinkEntities(dto.links);
    await this.items.save(item);
    return toDto(item);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const item = await this.getOwned(ownerId, id);
    await this.items.remove(item);
  }

  /** Apply a manual signed adjustment and record it in the audit ledger. */
  async adjust(
    ownerId: string,
    id: string,
    dto: AdjustInventoryDto,
  ): Promise<InventoryItemDto> {
    if (dto.delta === 0) {
      throw new BadRequestException('Adjustment cannot be zero.');
    }
    const item = await this.getOwned(ownerId, id);
    const next = item.quantity + dto.delta;
    if (next < 0) {
      throw new BadRequestException(
        `Adjustment would take stock below zero (have ${item.quantity}).`,
      );
    }
    await this.items.manager.transaction(async (tx) => {
      item.quantity = next;
      await tx.save(item);
      await tx.save(
        this.adjustments.create({
          ownerId,
          item,
          delta: dto.delta,
          reason: dto.reason,
          note: normalizeText(dto.note),
          orderId: null,
        }),
      );
    });
    return toDto(item);
  }

  /**
   * Draw down stock for a paid order: for every dish on the order, each
   * inventory item linked to it is decremented by `quantityPerUnit * line
   * quantity`, and a `sale` ledger row is written per affected item. A dish
   * with no linked inventory is a no-op. Stock may go negative (a waiter can
   * settle payment regardless of stock on hand).
   */
  async applyOrderConsumption(
    ownerId: string,
    orderId: string,
    lines: ConsumptionLine[],
  ): Promise<void> {
    await this.consume(ownerId, orderId, lines, 'sale', -1);
  }

  /** Reverse a previous consumption (order un-paid / merged away). */
  async revertOrderConsumption(
    ownerId: string,
    orderId: string,
    lines: ConsumptionLine[],
  ): Promise<void> {
    await this.consume(ownerId, orderId, lines, 'sale-reverted', +1);
  }

  /** Shared engine for apply/revert: `sign` is −1 to draw down, +1 to restore. */
  private async consume(
    ownerId: string,
    orderId: string,
    lines: ConsumptionLine[],
    reason: AdjustmentReason,
    sign: 1 | -1,
  ): Promise<void> {
    // Collapse duplicate dishes to a single quantity per dish.
    const soldByFood = new Map<string, number>();
    for (const line of lines) {
      soldByFood.set(
        line.foodItemId,
        (soldByFood.get(line.foodItemId) ?? 0) + line.quantity,
      );
    }
    const foodIds = [...soldByFood.keys()];
    if (foodIds.length === 0) return;

    // Every owner-scoped link touching one of the sold dishes.
    const links = await this.links.find({
      where: { foodItemId: In(foodIds), item: { ownerId } },
      relations: { item: true },
    });
    if (links.length === 0) return;

    // A dish may consume several items, and one item may be consumed by
    // several sold dishes — aggregate the net delta per inventory item.
    const affected = new Map<string, { item: InventoryItem; delta: number }>();
    for (const link of links) {
      const sold = soldByFood.get(link.foodItemId) ?? 0;
      if (sold === 0) continue;
      const delta = sign * link.quantityPerUnit * sold;
      const entry = affected.get(link.item.id);
      if (entry) entry.delta += delta;
      else affected.set(link.item.id, { item: link.item, delta });
    }
    if (affected.size === 0) return;

    await this.items.manager.transaction(async (tx) => {
      for (const { item, delta } of affected.values()) {
        if (delta === 0) continue;
        item.quantity = round4(item.quantity + delta);
        await tx.save(item);
        await tx.save(
          this.adjustments.create({
            ownerId,
            item,
            delta: round4(delta),
            reason,
            note: null,
            orderId,
          }),
        );
      }
    });
  }

  /** Fetch an inventory item, asserting it belongs to this owner (else 404). */
  private async getOwned(ownerId: string, id: string): Promise<InventoryItem> {
    const item = await this.items.findOne({ where: { id, ownerId } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }
}

/** Trim an optional string; blank/whitespace-only becomes null. */
function normalizeText(value?: string | null): string | null {
  return value?.trim() ? value.trim() : null;
}

/** Round to 4 dp — keeps fractional consumption (e.g. 0.2 kg) from drifting. */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Build link entities from the DTO, collapsing duplicate dishes (last wins). */
function toLinkEntities(dtos?: InventoryLinkDto[]): InventoryLink[] {
  if (!dtos?.length) return [];
  const byFood = new Map<string, InventoryLink>();
  for (const dto of dtos) {
    const link = new InventoryLink();
    link.foodItemId = dto.foodItemId;
    link.quantityPerUnit = dto.quantityPerUnit;
    byFood.set(dto.foodItemId, link);
  }
  return [...byFood.values()];
}

function isLowStock(item: InventoryItem): boolean {
  return (
    item.lowStockThreshold !== null && item.quantity <= item.lowStockThreshold
  );
}

function toDto(item: InventoryItem): InventoryItemDto {
  return {
    id: item.id,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    links: (item.links ?? []).map((l) => ({
      foodItemId: l.foodItemId,
      quantityPerUnit: l.quantityPerUnit,
    })),
    lowStockThreshold: item.lowStockThreshold,
    note: item.note,
    lowStock: isLowStock(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
