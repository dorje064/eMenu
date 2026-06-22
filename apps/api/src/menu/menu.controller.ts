import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { FoodItemDto } from './dto/food-item.dto';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a food item to the menu (requires auth)' })
  @ApiCreatedResponse({ type: FoodItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(@Body() dto: CreateFoodItemDto): Promise<FoodItemDto> {
    return this.menuService.create(dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List menu items, optionally filtered by category' })
  @ApiQuery({ name: 'category', required: false, example: 'Mains' })
  @ApiOkResponse({ type: [FoodItemDto] })
  findAll(@Query('category') category?: string): Promise<FoodItemDto[]> {
    return this.menuService.findAll(category);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a single menu item by id' })
  @ApiOkResponse({ type: FoodItemDto })
  @ApiNotFoundResponse({ description: 'Item not found' })
  findOne(@Param('id') id: string): Promise<FoodItemDto> {
    return this.menuService.findOne(id);
  }
}
