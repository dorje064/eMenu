import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class MergeOrdersDto {
  @ApiProperty({
    type: [String],
    description: 'Ids of the orders to merge into a single order (min 2).',
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('all', { each: true })
  orderIds!: string[];
}
