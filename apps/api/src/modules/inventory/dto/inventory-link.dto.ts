import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength, Min } from 'class-validator';

/** One dish → per-unit consumption pairing on an inventory item. */
export class InventoryLinkDto {
  @ApiProperty({ description: 'Linked menu dish id (food_items.id).' })
  @IsString()
  @MinLength(1)
  foodItemId!: string;

  @ApiProperty({
    example: 0.2,
    description: 'Units of this item consumed per one unit of the dish sold.',
  })
  @IsNumber()
  @Min(0)
  quantityPerUnit!: number;
}
