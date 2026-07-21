import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { BulkUploadResultDto } from './dto/bulk-upload-result.dto';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItem } from './entities/food-item.entity';
import { type MappedFoodRow } from './menu-bulk.util';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItems: Repository<FoodItem>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
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

  /**
   * Create many menu items from parsed spreadsheet rows. Partial success: every
   * valid row is created and invalid rows are reported (with their spreadsheet
   * row number) rather than failing the whole upload. Categories named in the
   * file that don't exist yet are auto-created so the new items group correctly.
   */
  async bulkCreate(
    ownerId: string,
    rows: MappedFoodRow[],
  ): Promise<BulkUploadResultDto> {
    if (rows.length === 0) {
      throw new BadRequestException(
        'No data rows found. Add rows under the header (name, category, price…).',
      );
    }

    const errors: { row: number; message: string }[] = [];
    const valid: CreateFoodItemDto[] = [];
    for (const row of rows) {
      const { dto, error } = await validateRow(row);
      if (error) errors.push({ row: row.rowNumber, message: error });
      else if (dto) valid.push(dto);
    }

    // Auto-create categories referenced by valid rows but not yet on file.
    const existing = await this.categories.find({ where: { ownerId } });
    const existingByLower = new Map(
      existing.map((c) => [c.name.toLowerCase(), c] as const),
    );
    const createdCategories: string[] = [];
    const seen = new Set<string>();
    let nextOrder = existing.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1;
    for (const dto of valid) {
      const key = dto.category.toLowerCase();
      if (existingByLower.has(key) || seen.has(key)) continue;
      seen.add(key);
      createdCategories.push(dto.category);
    }
    if (createdCategories.length) {
      await this.categories.save(
        createdCategories.map((name) =>
          this.categories.create({
            ownerId,
            name,
            sortOrder: nextOrder++,
            active: true,
          }),
        ),
      );
    }

    if (valid.length) {
      await this.foodItems.save(
        valid.map((dto) =>
          this.foodItems.create({
            ownerId,
            name: dto.name,
            description: dto.description ?? null,
            category: dto.category,
            price: dto.price,
            prepTimeMinutes: dto.prepTimeMinutes ?? 15,
            imageUrl: dto.imageUrl ?? null,
            available: dto.available ?? true,
          }),
        ),
      );
    }

    return {
      total: rows.length,
      created: valid.length,
      failed: errors.length,
      createdCategories,
      errors,
    };
  }
}

/** Coerce a raw row into a CreateFoodItemDto and validate it with the same
 *  rules as the single-create endpoint. Returns a joined error string when the
 *  row is invalid. */
async function validateRow(
  row: MappedFoodRow,
): Promise<{ dto?: CreateFoodItemDto; error?: string }> {
  const dto = plainToInstance(CreateFoodItemDto, {
    name: row.name,
    description: row.description || undefined,
    category: row.category,
    price: parseNumber(row.price),
    prepTimeMinutes: parseNumber(row.prepTimeMinutes),
    imageUrl: row.imageUrl || undefined,
    available: parseBoolean(row.available),
  });
  const failures = await validate(dto, { whitelist: true });
  if (failures.length) {
    const message = failures
      .flatMap((f) => Object.values(f.constraints ?? {}))
      .join('; ');
    return { error: message || 'Invalid row' };
  }
  return { dto };
}

/** Parse a numeric cell (tolerating currency symbols/commas). Empty → undefined
 *  so a required field fails validation; genuinely non-numeric text → NaN so
 *  IsNumber flags it (rather than silently collapsing "abc" to 0). */
function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const direct = Number(trimmed);
  if (!Number.isNaN(direct)) return direct;
  const cleaned = trimmed.replace(/[^0-9.\-]/g, '');
  return cleaned === '' ? NaN : Number(cleaned);
}

/** Parse a truthy/falsy cell. Empty → undefined (use the entity default);
 *  unrecognised text is returned as-is so IsBoolean rejects it. */
function parseBoolean(value: string): boolean | string | undefined {
  const v = value.trim().toLowerCase();
  if (v === '') return undefined;
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return value;
}
