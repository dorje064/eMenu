import { ApiProperty } from '@nestjs/swagger';

/** One day's total paid sales in the dashboard's 30-day series. */
export class SalesByDayDto {
  @ApiProperty({ example: '2026-07-07', description: 'Day (ISO date).' })
  date!: string;

  @ApiProperty({ example: 12400, description: 'Total paid sales that day.' })
  total!: number;
}

/** A best-selling item across paid orders in the window. */
export class TopItemDto {
  @ApiProperty({ example: 'Chicken Momo' })
  name!: string;

  @ApiProperty({ example: 42, description: 'Units sold.' })
  quantity!: number;

  @ApiProperty({ example: 8400, description: 'Revenue from this item.' })
  revenue!: number;
}

/** Aggregated figures backing the owner dashboard. */
export class OrderStatsDto {
  @ApiProperty({ example: 12400, description: "Total paid sales for today." })
  salesToday!: number;

  @ApiProperty({ example: 3200, description: "Total expenses recorded today." })
  expensesToday!: number;

  @ApiProperty({ example: 9200, description: 'salesToday − expensesToday.' })
  netIncome!: number;

  @ApiProperty({ type: [SalesByDayDto], description: 'Last 30 days, zero-filled.' })
  salesByDay!: SalesByDayDto[];

  @ApiProperty({ type: [TopItemDto], description: 'Top 5 items by units sold.' })
  topItems!: TopItemDto[];
}
