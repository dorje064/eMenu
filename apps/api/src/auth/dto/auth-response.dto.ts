import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({ example: '6f9619ff-8b86-d011-b42d-00cf4fc964ff' })
  id!: string;

  @ApiProperty({ example: 'diner@example.com' })
  email!: string;

  @ApiProperty({ example: 'Asha Sharma' })
  fullName!: string;

  @ApiProperty({ example: '+9779800000000', nullable: true })
  phone!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT bearer access token.' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ type: CustomerDto })
  customer!: CustomerDto;
}
