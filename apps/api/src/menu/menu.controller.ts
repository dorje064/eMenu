import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemDto } from './dto/food-item.dto';
import { ImageResultDto, UploadResultDto } from './dto/image-result.dto';
import { ImageService } from './image.service';
import { MenuService } from './menu.service';
import { imageMulterOptions, UPLOAD_ROUTE_PREFIX } from './upload.constants';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly imageService: ImageService,
  ) {}

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

  @Get('image-search')
  @ApiOperation({
    summary: 'Search stock images (Unsplash) to use as a food photo',
  })
  @ApiQuery({ name: 'q', required: true, example: 'margherita pizza' })
  @ApiOkResponse({ type: [ImageResultDto] })
  imageSearch(@Query('q') q?: string): Promise<ImageResultDto[]> {
    return this.imageService.search((q ?? '').trim());
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload a food image (requires auth)' })
  @ApiCreatedResponse({ type: UploadResultDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @UseInterceptors(FileInterceptor('file', imageMulterOptions))
  upload(@UploadedFile() file?: { filename: string }): UploadResultDto {
    if (!file) {
      throw new BadRequestException('No file uploaded under field "file".');
    }
    return { imageUrl: `${UPLOAD_ROUTE_PREFIX}/${file.filename}` };
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a single menu item by id' })
  @ApiOkResponse({ type: FoodItemDto })
  @ApiNotFoundResponse({ description: 'Item not found' })
  findOne(@Param('id') id: string): Promise<FoodItemDto> {
    return this.menuService.findOne(id);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a menu item (requires auth)' })
  @ApiOkResponse({ type: FoodItemDto })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodItemDto,
  ): Promise<FoodItemDto> {
    return this.menuService.update(id, dto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a menu item (requires auth)' })
  @ApiNoContentResponse({ description: 'Item deleted' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(@Param('id') id: string): Promise<void> {
    return this.menuService.remove(id);
  }
}
