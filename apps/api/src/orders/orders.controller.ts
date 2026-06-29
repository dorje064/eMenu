import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place an order from a table (public)' })
  @ApiCreatedResponse({ type: OrderDto })
  create(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.ordersService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders, optionally by status (requires auth)' })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiOkResponse({ type: [OrderDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  findAll(@Query('status') status?: string): Promise<OrderDto[]> {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by id (public — order confirmation)' })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOne(@Param('id') id: string): Promise<OrderDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an order status (requires auth)' })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(id, dto);
  }
}
