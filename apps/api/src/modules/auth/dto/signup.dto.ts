import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'diner@example.com',
    description: 'Unique email used to log in.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'S3curePass!',
    minLength: 8,
    description: 'Plain password (hashed server-side).',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Asha Sharma' })
  @IsString()
  @MinLength(1)
  fullName!: string;

  @ApiProperty({ example: '+9779800000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
