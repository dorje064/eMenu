import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryLink } from './inventory-link.entity';

/** A stock item tracked by a café owner (ingredients, drinks, supplies…).
 *  Scoped to the owner. Linked to zero or more menu dishes via `links`, each
 *  carrying how much of this item that dish consumes, so selling a linked dish
 *  on a paid order draws down this item's on-hand `quantity`. */
@Entity({ name: 'inventory_items' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  @Column()
  name!: string;

  /** Free-text unit label, e.g. "kg", "cans", "packs". */
  @Column({ type: 'varchar', nullable: true })
  unit!: string | null;

  /** Current on-hand stock. Mutated by paid-order consumption and manual
   *  adjustments. Stored as a real so fractional units (e.g. 2.5 kg) work. */
  @Column({ type: 'real', default: 0 })
  quantity!: number;

  /** Dishes whose sale consumes this item, each with a per-unit quantity. */
  @OneToMany(() => InventoryLink, (link) => link.item, {
    cascade: true,
    eager: true,
  })
  links!: InventoryLink[];

  /** Warn when quantity drops to/below this. Null = no low-stock warning. */
  @Column({ name: 'low_stock_threshold', type: 'real', nullable: true })
  lowStockThreshold!: number | null;

  /** Optional free-text detail. */
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
