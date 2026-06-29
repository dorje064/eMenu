import {
  ConflictException,
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

/** Default categories seeded when the table is empty, so the menu form
 *  has something to choose from out of the box. */
const DEFAULT_CATEGORIES: ReadonlyArray<Pick<Category, 'name' | 'sortOrder'>> =
  [
    { name: 'Breakfast', sortOrder: 0 },
    { name: 'Lunch', sortOrder: 1 },
    { name: 'Dinner', sortOrder: 2 },
    { name: 'Drinks', sortOrder: 3 },
    { name: 'Desserts', sortOrder: 4 },
  ];

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.categories.count();
    if (count === 0) {
      await this.categories.save(
        DEFAULT_CATEGORIES.map((c) => this.categories.create(c)),
      );
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categories.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      active: dto.active ?? true,
    });
    try {
      return await this.categories.save(category);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  findAll(activeOnly?: boolean): Promise<Category[]> {
    return this.categories.find({
      where: activeOnly ? { active: true } : {},
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined)
      category.description = dto.description ?? null;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.active !== undefined) category.active = dto.active;
    try {
      return await this.categories.save(category);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.categories.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }
}
