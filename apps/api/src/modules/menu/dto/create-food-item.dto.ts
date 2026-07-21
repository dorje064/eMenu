import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFoodItemDto {
  @ApiProperty({ example: 'Margherita Pizza' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example:
      'Wood-fired pizza with San Marzano tomato, fresh mozzarella and basil.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'Mains' })
  @IsString()
  @MinLength(1)
  category!: string;

  @ApiProperty({
    example: 12.5,
    description: 'Price in the restaurant currency.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 15,
    default: 15,
    description: 'Preparation time in minutes.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @ApiProperty({
    example: 'https://cdn.emenu.app/items/margherita.jpg',
    required: false,
    description:
      'Absolute http(s) URL (e.g. an Unsplash photo) or an app-relative upload path like /api/uploads/<file>.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(https?:\/\/|\/)/, {
    message: 'imageUrl must be an absolute http(s) URL or an app-relative path',
  })
  imageUrl?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
