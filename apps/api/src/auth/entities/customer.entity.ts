import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { UserRole } from '../roles';

/**
 * A login account. Either a café **owner** (`role='owner'`, `ownerId=null`) who
 * owns all of the café's data, or a **staff** member (kitchen / waiter) who
 * belongs to an owner via `ownerId` and has limited access.
 */
@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  /** bcrypt hash — never serialized out of the API. */
  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  /** Access level. Owners get full access; staff are limited by role. */
  @Column({ type: 'varchar', default: 'owner' })
  role!: UserRole;

  /**
   * Employing owner's id for staff accounts; `null` for owners themselves.
   * All tenant data is scoped by the *effective* café id (`ownerId ?? id`).
   */
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId!: string | null;

  /** Deactivated accounts (e.g. a removed shift worker) cannot log in. */
  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
