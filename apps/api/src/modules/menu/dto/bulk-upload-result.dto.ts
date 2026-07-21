import { ApiProperty } from '@nestjs/swagger';

export class BulkUploadRowErrorDto {
  @ApiProperty({ example: 4, description: 'Spreadsheet row number (header = 1).' })
  row!: number;

  @ApiProperty({ example: 'price must be a number; category is required' })
  message!: string;
}

export class BulkUploadResultDto {
  @ApiProperty({ example: 12, description: 'Data rows found in the file.' })
  total!: number;

  @ApiProperty({ example: 10, description: 'Menu items successfully created.' })
  created!: number;

  @ApiProperty({ example: 2, description: 'Rows skipped due to errors.' })
  failed!: number;

  @ApiProperty({
    type: [String],
    example: ['Sides', 'Beverages'],
    description: 'New categories auto-created from the file.',
  })
  createdCategories!: string[];

  @ApiProperty({ type: [BulkUploadRowErrorDto] })
  errors!: BulkUploadRowErrorDto[];
}
