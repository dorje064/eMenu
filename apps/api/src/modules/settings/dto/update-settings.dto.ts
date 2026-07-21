import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { MENU_TEMPLATES, type MenuTemplate } from '../menu-template';

export class UpdateSettingsDto {
  @ApiProperty({ enum: MENU_TEMPLATES, example: 'classic' })
  @IsIn(MENU_TEMPLATES)
  menuTemplate!: MenuTemplate;
}
