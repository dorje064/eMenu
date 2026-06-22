import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { FoodItem } from './entities/food-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItems: Repository<FoodItem>
  ) {}

  create(dto: CreateFoodItemDto): Promise<FoodItem> {
    const item = this.foodItems.create({
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category,
      price: dto.price,
      prepTimeMinutes: dto.prepTimeMinutes ?? 15,
      imageUrl: dto.imageUrl ?? null,
      available: dto.available ?? true,
    });
    return this.foodItems.save(item);
  }

  findAll(category?: string): Promise<FoodItem[]> {
    return this.foodItems.find({
      where: category ? { category } : {},
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<FoodItem> {
    const item = await this.foodItems.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Food item ${id} not found`);
    }
    return item;
  }
}
