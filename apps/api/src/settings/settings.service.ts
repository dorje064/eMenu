import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settings: Repository<Settings>,
  ) {}

  /** Returns the singleton settings row, creating it with defaults if absent. */
  async get(): Promise<Settings> {
    const existing = await this.settings.findOne({
      where: {},
      order: { updatedAt: 'ASC' },
    });
    if (existing) return existing;
    return this.settings.save(this.settings.create({}));
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    const current = await this.get();
    current.menuTemplate = dto.menuTemplate;
    return this.settings.save(current);
  }
}
