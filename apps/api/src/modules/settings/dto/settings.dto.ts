import { ApiProperty } from '@nestjs/swagger';
import { MENU_TEMPLATES, type MenuTemplate } from '../menu-template';

export class SettingsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MENU_TEMPLATES, example: 'classic' })
  menuTemplate!: MenuTemplate;

  @ApiProperty()
  updatedAt!: Date;
}
