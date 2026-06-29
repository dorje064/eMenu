import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { TableDto } from './dto/table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a table (requires auth)' })
  @ApiCreatedResponse({ type: TableDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(@Body() dto: CreateTableDto): Promise<TableDto> {
    return this.tablesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tables' })
  @ApiOkResponse({ type: [TableDto] })
  findAll(): Promise<TableDto[]> {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single table by id' })
  @ApiOkResponse({ type: TableDto })
  @ApiNotFoundResponse({ description: 'Table not found' })
  findOne(@Param('id') id: string): Promise<TableDto> {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a table (requires auth)' })
  @ApiOkResponse({ type: TableDto })
  @ApiNotFoundResponse({ description: 'Table not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTableDto
  ): Promise<TableDto> {
    return this.tablesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a table (requires auth)' })
  @ApiNoContentResponse({ description: 'Table deleted' })
  @ApiNotFoundResponse({ description: 'Table not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(@Param('id') id: string): Promise<void> {
    return this.tablesService.remove(id);
  }
}
