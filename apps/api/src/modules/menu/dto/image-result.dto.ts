import { ApiProperty } from '@nestjs/swagger';

/** A single image-search hit returned to the picker grid. */
export class ImageResultDto {
  @ApiProperty({ description: 'Provider image id.' })
  id!: string;

  @ApiProperty({ description: 'Small thumbnail URL shown in the picker grid.' })
  thumbUrl!: string;

  @ApiProperty({ description: 'Full-resolution URL stored on the food item.' })
  fullUrl!: string;

  @ApiProperty({ nullable: true, description: 'Alt/description text, if any.' })
  alt!: string | null;

  @ApiProperty({ description: 'Photographer / source attribution.' })
  credit!: string;

  @ApiProperty({
    description: 'Link to the source page (attribution requirement).',
  })
  sourceUrl!: string;
}

/** Result of a successful image upload. */
export class UploadResultDto {
  @ApiProperty({ example: '/api/uploads/3f2a1b7c-....jpg' })
  imageUrl!: string;
}
