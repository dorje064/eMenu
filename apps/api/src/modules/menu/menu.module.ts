import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { FoodItem } from './entities/food-item.entity';
import { ImageService } from './image.service';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItem, Category])],
  controllers: [MenuController],
  providers: [MenuService, ImageService],
  exports: [MenuService],
})
export class MenuModule {}
