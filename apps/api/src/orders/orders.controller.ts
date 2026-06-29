import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
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
  @ApiOperation({ summary: "List this café's orders, optionally by status" })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiOkResponse({ type: [OrderDto] })
  findAll(
    @OwnerId() ownerId: string,
    @Query('status') status?: string
  ): Promise<OrderDto[]> {
    return this.ordersService.findAll(ownerId, status);
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
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(ownerId, id, dto);
  }
}
