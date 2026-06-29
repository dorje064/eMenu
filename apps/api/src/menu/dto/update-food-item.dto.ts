import { PartialType } from '@nestjs/swagger';
import { CreateFoodItemDto } from './create-food-item.dto';

/** All fields optional — patch only what's provided. */
export class UpdateFoodItemDto extends PartialType(CreateFoodItemDto) {}
