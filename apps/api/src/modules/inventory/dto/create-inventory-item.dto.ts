import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { InventoryLinkDto } from './inventory-link.dto';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Mozzarella', description: 'Inventory item name.' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 20, description: 'On-hand quantity (>= 0).' })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    required: false,
    example: 'kg',
    description: 'Unit label (kg, cans, packs…).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({
    required: false,
    type: [InventoryLinkDto],
    description: 'Dishes whose sale consumes this item, with per-unit amounts.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryLinkDto)
  links?: InventoryLinkDto[];

  @ApiProperty({
    required: false,
    example: 5,
    description: 'Warn when quantity drops to/below this. Omit to disable.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({ required: false, example: 'Supplier: Local Dairy' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
