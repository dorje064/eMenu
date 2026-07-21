import { ApiProperty } from '@nestjs/swagger';

export class ExpenseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 1500 })
  amount!: number;

  @ApiProperty({ example: 'Supplies' })
  category!: string;

  @ApiProperty({ nullable: true, example: 'Vegetables from the market' })
  note!: string | null;

  @ApiProperty({ example: '2026-07-07', description: 'Day incurred (ISO date).' })
  spentAt!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
