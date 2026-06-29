import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: 't1', description: 'Table name, e.g. "1" or "t1".' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
