import { ApiProperty } from '@nestjs/swagger';

export class TableDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 't1' })
  name!: string;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
