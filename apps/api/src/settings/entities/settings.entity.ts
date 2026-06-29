import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DEFAULT_MENU_TEMPLATE, type MenuTemplate } from '../menu-template';

/** Per-café settings shared by the admin and customer apps (one row per owner). */
@Entity({ name: 'settings' })
@Unique(['ownerId'])
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning café account (Customer.id). */
  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId!: string;

  /** Which menu layout the customer app should render. */
  @Column({
    name: 'menu_template',
    type: 'varchar',
    default: DEFAULT_MENU_TEMPLATE,
  })
  menuTemplate!: MenuTemplate;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
