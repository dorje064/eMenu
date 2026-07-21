import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'b1f1…', description: 'Food item id.' })
  @IsString()
  @MinLength(1)
  foodItemId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'b1f1…', description: 'Café (owner) id, from the QR.' })
  @IsString()
  @MinLength(1)
  cafeId!: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  tableNumber!: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({ required: false, example: 'No onions please.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
