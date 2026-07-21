import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

/** Links an inventory item to a menu dish, with how much of the item one unit
 *  of that dish consumes. Selling 3 of the dish on a paid order draws down
 *  `quantityPerUnit * 3` from the inventory item. An item can link to many
 *  dishes, and a dish can be linked from many items. */
@Entity({ name: 'inventory_links' })
export class InventoryLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryItem, (item) => item.links, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  item!: InventoryItem;

  /** Linked menu dish (food_items.id). Plain varchar, mirroring order_items. */
  @Index()
  @Column({ name: 'food_item_id', type: 'varchar' })
  foodItemId!: string;

  /** Units of the inventory item consumed per one unit of the dish sold. */
  @Column({ name: 'quantity_per_unit', type: 'real', default: 1 })
  quantityPerUnit!: number;
}
