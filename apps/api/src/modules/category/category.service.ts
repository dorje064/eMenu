import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

/** Default categories seeded for a new café so the menu form has something
 *  to choose from out of the box. */
const DEFAULT_CATEGORIES: ReadonlyArray<Pick<Category, 'name' | 'sortOrder'>> =
  [
    { name: 'Breakfast', sortOrder: 0 },
    { name: 'Snacks', sortOrder: 1 },
    { name: 'Lunch', sortOrder: 2 },
    { name: 'Dinner', sortOrder: 3 },
    { name: 'Drinks', sortOrder: 4 },
    { name: 'Desserts', sortOrder: 5 },
  ];

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  /** Seed the default categories for a newly-created café owner. */
  async seedDefaults(ownerId: string): Promise<void> {
    await this.categories.save(
      DEFAULT_CATEGORIES.map((c) => this.categories.create({ ...c, ownerId })),
    );
  }

  async create(ownerId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categories.create({
      ownerId,
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

  findAll(ownerId: string, activeOnly?: boolean): Promise<Category[]> {
    return this.categories.find({
      where: activeOnly ? { ownerId, active: true } : { ownerId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(ownerId: string, id: string): Promise<Category> {
    const category = await this.categories.findOne({ where: { id, ownerId } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(ownerId, id);
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

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.categories.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }
}
