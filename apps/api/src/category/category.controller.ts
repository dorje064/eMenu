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
import { OwnerId } from '../auth/owner-id.decorator';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a menu category' })
  @ApiCreatedResponse({ type: CategoryDto })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateCategoryDto
  ): Promise<CategoryDto> {
    return this.categoryService.create(ownerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List this café's menu categories" })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiOkResponse({ type: [CategoryDto] })
  findAll(
    @OwnerId() ownerId: string,
    @Query('activeOnly') activeOnly?: boolean
  ): Promise<CategoryDto[]> {
    return this.categoryService.findAll(ownerId, activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by id' })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(
    @OwnerId() ownerId: string,
    @Param('id') id: string
  ): Promise<CategoryDto> {
    return this.categoryService.findOne(ownerId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto
  ): Promise<CategoryDto> {
    return this.categoryService.update(ownerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(
    @OwnerId() ownerId: string,
    @Param('id') id: string
  ): Promise<void> {
    return this.categoryService.remove(ownerId, id);
  }
}
