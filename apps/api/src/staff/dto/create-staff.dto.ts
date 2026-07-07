import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { STAFF_ROLES, type StaffRole } from '../../auth/roles';

export class CreateStaffDto {
  @ApiProperty({ example: 'ram@cafe.com', description: 'Unique login email.' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Ram Thapa' })
  @IsString()
  @MinLength(1)
  fullName!: string;

  @ApiProperty({ enum: STAFF_ROLES, example: 'kitchen' })
  @IsIn(STAFF_ROLES as readonly string[])
  role!: StaffRole;

  @ApiProperty({
    example: 'S3curePass!',
    minLength: 8,
    description: 'Initial password set by the owner (hashed server-side).',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
