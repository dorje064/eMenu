import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { STAFF_ROLES, type StaffRole } from '../../auth/roles';

export class UpdateStaffDto {
  @ApiProperty({ enum: STAFF_ROLES, required: false })
  @IsOptional()
  @IsIn(STAFF_ROLES as readonly string[])
  role?: StaffRole;

  @ApiProperty({
    required: false,
    description: 'Deactivate (false) to block login without deleting.',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
