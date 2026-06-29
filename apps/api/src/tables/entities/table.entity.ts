import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** A physical table in the restaurant. Its QR code links customers to the
 *  menu with this table's number attached so orders are tied to the table. */
@Entity({ name: 'restaurant_tables' })
export class RestaurantTable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Human-facing table name/identifier, e.g. "1", "t1" or "Patio 3". Unique. */
  @Column({ unique: true })
  name!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
