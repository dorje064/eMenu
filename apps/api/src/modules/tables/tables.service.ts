import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { RestaurantTable } from './entities/table.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(RestaurantTable)
    private readonly tables: Repository<RestaurantTable>
  ) {}

  async create(ownerId: string, dto: CreateTableDto): Promise<RestaurantTable> {
    const table = this.tables.create({
      ownerId,
      name: dto.name,
      active: dto.active ?? true,
    });
    try {
      return await this.tables.save(table);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException(`Table "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  findAll(ownerId: string): Promise<RestaurantTable[]> {
    return this.tables.find({ where: { ownerId }, order: { name: 'ASC' } });
  }

  async findOne(ownerId: string, id: string): Promise<RestaurantTable> {
    const table = await this.tables.findOne({ where: { id, ownerId } });
    if (!table) {
      throw new NotFoundException(`Table ${id} not found`);
    }
    return table;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateTableDto
  ): Promise<RestaurantTable> {
    const table = await this.findOne(ownerId, id);
    if (dto.name !== undefined) table.name = dto.name;
    if (dto.active !== undefined) table.active = dto.active;
    try {
      return await this.tables.save(table);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException(`Table "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.tables.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`Table ${id} not found`);
    }
  }
}
