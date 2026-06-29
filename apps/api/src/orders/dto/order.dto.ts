import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUSES, type OrderStatus } from '../order-status';

export class OrderItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  foodItemId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  quantity!: number;
}

export class OrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '12' })
  tableNumber!: string;

  @ApiProperty({ enum: ORDER_STATUSES })
  status!: OrderStatus;

  @ApiProperty({ nullable: true })
  note!: string | null;

  @ApiProperty()
  total!: number;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
