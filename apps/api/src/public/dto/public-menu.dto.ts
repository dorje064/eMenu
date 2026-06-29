import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from '../../category/dto/category.dto';
import { FoodItemDto } from '../../menu/dto/food-item.dto';
import { MENU_TEMPLATES, type MenuTemplate } from '../../settings/menu-template';

/** Everything the public customer app needs to render one café's menu. */
export class PublicMenuDto {
  @ApiProperty({ type: [CategoryDto] })
  categories!: CategoryDto[];

  @ApiProperty({ type: [FoodItemDto] })
  items!: FoodItemDto[];

  @ApiProperty({ enum: MENU_TEMPLATES })
  menuTemplate!: MenuTemplate;
}
