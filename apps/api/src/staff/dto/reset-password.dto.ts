import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'N3wPass!23',
    minLength: 8,
    description: 'New password for the staff member (hashed server-side).',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
