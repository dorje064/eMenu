import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settings: Repository<Settings>
  ) {}

  /** Returns this café's settings row, creating it with defaults if absent. */
  async get(ownerId: string): Promise<Settings> {
    const existing = await this.settings.findOne({ where: { ownerId } });
    if (existing) return existing;
    return this.settings.save(this.settings.create({ ownerId }));
  }

  async update(ownerId: string, dto: UpdateSettingsDto): Promise<Settings> {
    const current = await this.get(ownerId);
    current.menuTemplate = dto.menuTemplate;
    return this.settings.save(current);
  }
}
