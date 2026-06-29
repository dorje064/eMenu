import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DEFAULT_MENU_TEMPLATE, type MenuTemplate } from '../menu-template';

/** Singleton row of restaurant-wide settings shared by admin and customer apps. */
@Entity({ name: 'settings' })
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
