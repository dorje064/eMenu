import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (requires auth)' })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (requires auth)' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}
