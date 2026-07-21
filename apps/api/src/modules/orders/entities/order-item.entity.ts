import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

/** A single line on an order. Name and price are snapshotted at order time so
 *  later menu edits don't rewrite historical orders. */
@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  order!: Order;

  @Column({ name: 'food_item_id', type: 'varchar' })
  foodItemId!: string;

  @Column()
  name!: string;

  @Column({ type: 'real' })
  price!: number;

  @Column({ type: 'integer' })
  quantity!: number;
}
