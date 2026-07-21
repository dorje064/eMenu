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
import { OwnerId } from '../auth/owner-id.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BulkUploadResultDto } from './dto/bulk-upload-result.dto';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemDto } from './dto/food-item.dto';
import { ImageResultDto, UploadResultDto } from './dto/image-result.dto';
import { ImageService } from './image.service';
import { parseMenuSpreadsheet } from './menu-bulk.util';
import { MenuService } from './menu.service';
import {
  imageMulterOptions,
  spreadsheetMulterOptions,
  UPLOAD_ROUTE_PREFIX,
} from './upload.constants';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly imageService: ImageService,
  ) {}

  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a food item to the menu (requires auth)' })
  @ApiCreatedResponse({ type: FoodItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateFoodItemDto,
  ): Promise<FoodItemDto> {
    return this.menuService.create(ownerId, dto);
  }

  @Get('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: "List this café's menu items (requires auth)" })
  @ApiQuery({ name: 'category', required: false, example: 'Mains' })
  @ApiOkResponse({ type: [FoodItemDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  findAll(
    @OwnerId() ownerId: string,
    @Query('category') category?: string,
  ): Promise<FoodItemDto[]> {
    return this.menuService.findAll(ownerId, category);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
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

  @Post('items/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({
    summary: 'Bulk-create menu items from a .csv or .xlsx file (requires auth)',
  })
  @ApiCreatedResponse({ type: BulkUploadResultDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @UseInterceptors(FileInterceptor('file', spreadsheetMulterOptions))
  bulkUpload(
    @OwnerId() ownerId: string,
    @UploadedFile() file?: { buffer: Buffer },
  ): Promise<BulkUploadResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded under field "file".');
    }
    const rows = parseMenuSpreadsheet(file.buffer);
    return this.menuService.bulkCreate(ownerId, rows);
  }

  @Get('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single menu item by id (requires auth)' })
  @ApiOkResponse({ type: FoodItemDto })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  findOne(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
  ): Promise<FoodItemDto> {
    return this.menuService.findOne(ownerId, id);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a menu item (requires auth)' })
  @ApiOkResponse({ type: FoodItemDto })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFoodItemDto,
  ): Promise<FoodItemDto> {
    return this.menuService.update(ownerId, id, dto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a menu item (requires auth)' })
  @ApiNoContentResponse({ description: 'Item deleted' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(@OwnerId() ownerId: string, @Param('id') id: string): Promise<void> {
    return this.menuService.remove(ownerId, id);
  }
}
