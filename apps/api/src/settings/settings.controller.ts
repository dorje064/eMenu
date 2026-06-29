import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnerId } from '../auth/owner-id.decorator';
import { SettingsDto } from './dto/settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get this café's settings (e.g. customer menu template)" })
  @ApiOkResponse({ type: SettingsDto })
  get(@OwnerId() ownerId: string): Promise<SettingsDto> {
    return this.settingsService.get(ownerId);
  }

  @Patch()
  @ApiOperation({ summary: "Update this café's settings" })
  @ApiOkResponse({ type: SettingsDto })
  update(
    @OwnerId() ownerId: string,
    @Body() dto: UpdateSettingsDto
  ): Promise<SettingsDto> {
    return this.settingsService.update(ownerId, dto);
  }
}
