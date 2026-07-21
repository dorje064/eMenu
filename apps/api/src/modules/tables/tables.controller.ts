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
import { OwnerId } from '../auth/owner-id.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { TableDto } from './dto/table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';

@ApiTags('tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a table' })
  @ApiCreatedResponse({ type: TableDto })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateTableDto,
  ): Promise<TableDto> {
    return this.tablesService.create(ownerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List this café's tables" })
  @ApiOkResponse({ type: [TableDto] })
  findAll(@OwnerId() ownerId: string): Promise<TableDto[]> {
    return this.tablesService.findAll(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single table by id' })
  @ApiOkResponse({ type: TableDto })
  @ApiNotFoundResponse({ description: 'Table not found' })
  findOne(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
  ): Promise<TableDto> {
    return this.tablesService.findOne(ownerId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a table' })
  @ApiOkResponse({ type: TableDto })
  @ApiNotFoundResponse({ description: 'Table not found' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableDto> {
    return this.tablesService.update(ownerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a table' })
  @ApiNoContentResponse({ description: 'Table deleted' })
  @ApiNotFoundResponse({ description: 'Table not found' })
  remove(@OwnerId() ownerId: string, @Param('id') id: string): Promise<void> {
    return this.tablesService.remove(ownerId, id);
  }
}
