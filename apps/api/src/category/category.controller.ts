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
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a menu category (requires auth)' })
  @ApiCreatedResponse({ type: CategoryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List menu categories' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiOkResponse({ type: [CategoryDto] })
  findAll(@Query('activeOnly') activeOnly?: boolean): Promise<CategoryDto[]> {
    return this.categoryService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by id' })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.findOne(id);
  }
}
