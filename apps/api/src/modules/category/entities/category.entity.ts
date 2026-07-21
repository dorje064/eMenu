import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/** A grouping for menu items, e.g. Breakfast, Lunch, Drinks.
 *  Scoped to the café owner; names are unique per owner. */
@Entity({ name: 'categories' })
@Unique(['ownerId', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Lower numbers sort first when listing categories. */
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
