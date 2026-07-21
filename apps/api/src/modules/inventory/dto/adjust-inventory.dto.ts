import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  MANUAL_ADJUSTMENT_REASONS,
  type ManualAdjustmentReason,
} from '../inventory-adjustment-reason';

/** Manually change an item's on-hand quantity by a signed `delta`
 *  (e.g. +10 restock, −3 waste). */
export class AdjustInventoryDto {
  @ApiProperty({
    example: -3,
    description: 'Signed change to apply (positive adds stock, negative removes).',
  })
  @IsNumber()
  delta!: number;

  @ApiProperty({
    enum: MANUAL_ADJUSTMENT_REASONS,
    example: 'restock',
    description: 'Why the quantity changed.',
  })
  @IsIn(MANUAL_ADJUSTMENT_REASONS as unknown as string[])
  reason!: ManualAdjustmentReason;

  @ApiProperty({ required: false, example: 'Spoiled overnight' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
