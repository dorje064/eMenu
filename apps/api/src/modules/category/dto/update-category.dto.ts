import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/** All fields optional — patch only what's provided. */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
