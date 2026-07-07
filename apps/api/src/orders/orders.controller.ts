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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnerId } from '../auth/owner-id.decorator';
import { CurrentCustomer } from '../auth/current-customer.decorator';
import { Customer } from '../auth/entities/customer.entity';
import { MergeOrdersDto } from './dto/merge-orders.dto';
import { OrderDto } from './dto/order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: "List this café's orders, optionally by status and/or table",
  })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiQuery({ name: 'table', required: false, example: '12' })
  @ApiOkResponse({ type: [OrderDto] })
  findAll(
    @OwnerId() ownerId: string,
    @Query('status') status?: string,
    @Query('table') table?: string
  ): Promise<OrderDto[]> {
    return this.ordersService.findAll(ownerId, status, table);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge several same-table orders into one' })
  @ApiOkResponse({ type: OrderDto })
  @ApiBadRequestResponse({ description: 'Orders span multiple tables' })
  @ApiNotFoundResponse({ description: 'One or more orders not found' })
  merge(
    @OwnerId() ownerId: string,
    @Body() dto: MergeOrdersDto
  ): Promise<OrderDto> {
    return this.ordersService.mergeOrders(ownerId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by id' })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOne(
    @OwnerId() ownerId: string,
    @Param('id') id: string
  ): Promise<OrderDto> {
    return this.ordersService.findOne(ownerId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update an order status' })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  updateStatus(
    @OwnerId() ownerId: string,
    @CurrentCustomer() user: Customer,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(ownerId, id, dto, user.role);
  }
}
