import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from '../../modules/category/dto/category.dto';
import { FoodItemDto } from '../../modules/menu/dto/food-item.dto';
import {
  MENU_TEMPLATES,
  type MenuTemplate,
} from '../../modules/settings/menu-template';

/** Everything the public customer app needs to render one café's menu. */
export class PublicMenuDto {
  @ApiProperty({ type: [CategoryDto] })
  categories!: CategoryDto[];

  @ApiProperty({ type: [FoodItemDto] })
  items!: FoodItemDto[];

  @ApiProperty({ enum: MENU_TEMPLATES })
  menuTemplate!: MenuTemplate;
}
