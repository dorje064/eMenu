import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnerId } from '../auth/owner-id.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { InventoryItemDto } from './dto/inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'Only café owners can manage inventory' })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add an inventory item' })
  @ApiCreatedResponse({ type: InventoryItemDto })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryService.create(ownerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List this café's inventory items" })
  @ApiOkResponse({ type: [InventoryItemDto] })
  findAll(@OwnerId() ownerId: string): Promise<InventoryItemDto[]> {
    return this.inventoryService.findAll(ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiOkResponse({ type: InventoryItemDto })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryService.update(ownerId, id, dto);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Manually adjust an item\'s on-hand quantity' })
  @ApiOkResponse({ type: InventoryItemDto })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  adjust(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: AdjustInventoryDto,
  ): Promise<InventoryItemDto> {
    return this.inventoryService.adjust(ownerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiNoContentResponse({ description: 'Inventory item removed' })
  @ApiNotFoundResponse({ description: 'Inventory item not found' })
  remove(@OwnerId() ownerId: string, @Param('id') id: string): Promise<void> {
    return this.inventoryService.remove(ownerId, id);
  }
}
