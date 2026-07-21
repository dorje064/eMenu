import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type OrderStatus } from '../order-status';
import { OrderItem } from './order-item.entity';

/** A customer order placed from a table's QR menu. Scoped to the café owner. */
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  /** The table the order was placed from (matches RestaurantTable.name). */
  @Column({ name: 'table_number', type: 'varchar' })
  tableNumber!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: OrderStatus;

  /** Optional free-text note from the customer. */
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'real', default: 0 })
  total!: number;

  /** Whether this order's inventory consumption has been applied. Set true when
   *  the order is marked `paid`, back to false if it leaves `paid`. Guards
   *  against double-deducting stock across repeated status changes. */
  @Column({ name: 'stock_applied', type: 'boolean', default: false })
  stockApplied!: boolean;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
