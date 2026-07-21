import { ApiProperty } from '@nestjs/swagger';
import { InventoryLinkDto } from './inventory-link.dto';

export class InventoryItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Mozzarella' })
  name!: string;

  @ApiProperty({ nullable: true, example: 'kg' })
  unit!: string | null;

  @ApiProperty({ example: 20 })
  quantity!: number;

  @ApiProperty({
    type: [InventoryLinkDto],
    description: 'Dishes whose sale consumes this item, with per-unit amounts.',
  })
  links!: InventoryLinkDto[];

  @ApiProperty({ nullable: true, example: 5 })
  lowStockThreshold!: number | null;

  @ApiProperty({ nullable: true, example: 'Supplier: Local Dairy' })
  note!: string | null;

  @ApiProperty({
    description: 'True when a threshold is set and quantity is at/below it.',
  })
  lowStock!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
