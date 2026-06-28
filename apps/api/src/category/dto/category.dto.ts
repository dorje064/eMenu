import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Breakfast' })
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
