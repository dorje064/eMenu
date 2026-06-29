import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsDto } from './dto/settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get restaurant settings (e.g. customer menu template)',
  })
  @ApiOkResponse({ type: SettingsDto })
  get(): Promise<SettingsDto> {
    return this.settingsService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant settings (requires auth)' })
  @ApiOkResponse({ type: SettingsDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(@Body() dto: UpdateSettingsDto): Promise<SettingsDto> {
    return this.settingsService.update(dto);
  }
}
