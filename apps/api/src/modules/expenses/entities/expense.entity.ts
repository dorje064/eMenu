import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** A business expense recorded by a café owner (rent, supplies, wages…).
 *  Scoped to the café owner and used by the dashboard to compute net income. */
@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Index()
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  /** Amount spent, in the restaurant's currency. Stored as a real. */
  @Column({ type: 'real' })
  amount!: number;

  /** Free-text bucket for the expense, e.g. "Supplies", "Rent", "Wages". */
  @Column({ type: 'varchar' })
  category!: string;

  /** Optional free-text detail. */
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  /** The day the expense was incurred (user-settable, so it can be backdated). */
  @Column({ name: 'spent_at', type: 'date' })
  spentAt!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
