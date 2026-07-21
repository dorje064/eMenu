import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { type AdjustmentReason } from '../inventory-adjustment-reason';
import { InventoryItem } from './inventory-item.entity';

/** An audit-log entry for every change to an inventory item's quantity —
 *  manual adjustments (restock/waste/correction) and automatic paid-order
 *  consumption (sale / sale-reverted). `delta` is signed. */
@Entity({ name: 'inventory_adjustments' })
export class InventoryAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  @ManyToOne(() => InventoryItem, {
    onDelete: 'CASCADE',
  })
  item!: InventoryItem;

  /** Signed change applied to the item's quantity (+restock, −waste/sale). */
  @Column({ type: 'real' })
  delta!: number;

  @Column({ type: 'varchar' })
  reason!: AdjustmentReason;

  /** Optional free-text detail (mostly for manual adjustments). */
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  /** The order that drove this change, for `sale` / `sale-reverted` rows. */
  @Column({ name: 'order_id', type: 'varchar', nullable: true })
  orderId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
