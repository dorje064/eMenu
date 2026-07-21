import { PartialType } from '@nestjs/swagger';
import { CreateInventoryItemDto } from './create-inventory-item.dto';

/** All fields optional — patch an existing inventory item. */
export class UpdateInventoryItemDto extends PartialType(
  CreateInventoryItemDto,
) {}
