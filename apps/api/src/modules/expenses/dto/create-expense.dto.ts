import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 1500, description: 'Amount spent (>= 0).' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'Supplies', description: 'Expense category / bucket.' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category!: string;

  @ApiProperty({ required: false, example: 'Vegetables from the market' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    required: false,
    example: '2026-07-07',
    description: 'Day the expense was incurred (ISO date). Defaults to today.',
  })
  @IsOptional()
  @IsDateString()
  spentAt?: string;
}
