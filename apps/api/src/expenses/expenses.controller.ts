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
  ApiForbiddenResponse,
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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'Only café owners can manage expenses' })
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Record a business expense' })
  @ApiCreatedResponse({ type: ExpenseDto })
  create(
    @OwnerId() ownerId: string,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expensesService.create(ownerId, dto);
  }

  @Get()
  @ApiOperation({
    summary: "List this café's expenses, optionally within a date range",
  })
  @ApiQuery({ name: 'from', required: false, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-07-07' })
  @ApiOkResponse({ type: [ExpenseDto] })
  findAll(
    @OwnerId() ownerId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ExpenseDto[]> {
    return this.expensesService.findAll(ownerId, { from, to });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiOkResponse({ type: ExpenseDto })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  update(
    @OwnerId() ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expensesService.update(ownerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiNoContentResponse({ description: 'Expense removed' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  remove(@OwnerId() ownerId: string, @Param('id') id: string): Promise<void> {
    return this.expensesService.remove(ownerId, id);
  }
}
