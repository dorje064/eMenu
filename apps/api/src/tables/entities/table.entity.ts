import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/** A physical table in the restaurant. Its QR code links customers to the
 *  menu with this table's name attached so orders are tied to the table.
 *  Scoped to the café owner; names are unique per owner. */
@Entity({ name: 'restaurant_tables' })
@Unique(['ownerId', 'name'])
export class RestaurantTable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  /** Human-facing table name/identifier, e.g. "1", "t1" or "Patio 3". */
  @Column()
  name!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
