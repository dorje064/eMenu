import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from '../category/category.service';
import { MenuService } from '../menu/menu.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrderDto } from '../orders/dto/order.dto';
import { OrdersService } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
import { PublicMenuDto } from './dto/public-menu.dto';

/**
 * Unauthenticated surface for the customer app. The café is identified by the
 * `cafe` id embedded in the table's QR code, so every response is scoped to
 * that one café.
 */
@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly menuService: MenuService,
    private readonly categoryService: CategoryService,
    private readonly settingsService: SettingsService,
    private readonly ordersService: OrdersService
  ) {}

  @Get('menu')
  @ApiOperation({ summary: "Get a café's full menu (categories, items, template)" })
  @ApiQuery({ name: 'cafe', required: true, description: 'Café (owner) id.' })
  @ApiOkResponse({ type: PublicMenuDto })
  async menu(@Query('cafe') cafe?: string): Promise<PublicMenuDto> {
    const ownerId = cafe?.trim();
    if (!ownerId) {
      throw new BadRequestException('Missing "cafe" id.');
    }
    const [categories, items, settings] = await Promise.all([
      this.categoryService.findAll(ownerId, true),
      this.menuService.findAll(ownerId),
      this.settingsService.get(ownerId),
    ]);
    return { categories, items, menuTemplate: settings.menuTemplate };
  }

  @Post('orders')
  @ApiOperation({ summary: 'Place an order from a table (public)' })
  @ApiCreatedResponse({ type: OrderDto })
  createOrder(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.ordersService.create(dto.cafeId, dto);
  }
}
