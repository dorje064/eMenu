import { ApiProperty } from '@nestjs/swagger';

export class FoodItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Margherita Pizza' })
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'Mains' })
  category!: string;

  @ApiProperty({ example: 12.5 })
  price!: number;

  @ApiProperty({ example: 15 })
  prepTimeMinutes!: number;

  @ApiProperty({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
