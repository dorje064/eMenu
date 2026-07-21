import { ApiProperty } from '@nestjs/swagger';
import { STAFF_ROLES, type StaffRole } from '../../auth/roles';

export class StaffDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'ram@cafe.com' })
  email!: string;

  @ApiProperty({ example: 'Ram Thapa' })
  fullName!: string;

  @ApiProperty({ enum: STAFF_ROLES, example: 'kitchen' })
  role!: StaffRole;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
