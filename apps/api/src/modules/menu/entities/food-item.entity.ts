import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** A dish on a restaurant menu. Scoped to the café owner. */
@Entity({ name: 'food_items' })
export class FoodItem {
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

  @Column()
  category!: string;

  /** Price in the restaurant's currency. Stored as a real for SQLite. */
  @Column({ type: 'real' })
  price!: number;

  @Column({ name: 'prep_time_minutes', type: 'integer', default: 15 })
  prepTimeMinutes!: number;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  available!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
