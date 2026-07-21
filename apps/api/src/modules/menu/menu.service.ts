import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItem } from './entities/food-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItems: Repository<FoodItem>
  ) {}

  create(ownerId: string, dto: CreateFoodItemDto): Promise<FoodItem> {
    const item = this.foodItems.create({
      ownerId,
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

  findAll(ownerId: string, category?: string): Promise<FoodItem[]> {
    return this.foodItems.find({
      where: category ? { ownerId, category } : { ownerId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(ownerId: string, id: string): Promise<FoodItem> {
    const item = await this.foodItems.findOne({ where: { id, ownerId } });
    if (!item) {
      throw new NotFoundException(`Food item ${id} not found`);
    }
    return item;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateFoodItemDto
  ): Promise<FoodItem> {
    const item = await this.findOne(ownerId, id);
    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined)
      item.description = dto.description ?? null;
    if (dto.category !== undefined) item.category = dto.category;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.prepTimeMinutes !== undefined)
      item.prepTimeMinutes = dto.prepTimeMinutes;
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl ?? null;
    if (dto.available !== undefined) item.available = dto.available;
    return this.foodItems.save(item);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.foodItems.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`Food item ${id} not found`);
    }
  }
}
