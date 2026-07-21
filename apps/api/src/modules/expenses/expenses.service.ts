import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { localDateKey } from '../../common/date.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

/**
 * Expense tracking for a café owner. Every query/mutation is scoped to the
 * calling owner so one café can never touch another's expenses.
 */
@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
  ) {}

  async create(ownerId: string, dto: CreateExpenseDto): Promise<ExpenseDto> {
    const expense = this.expenses.create({
      ownerId,
      amount: dto.amount,
      category: dto.category,
      note: normalizeNote(dto.note),
      spentAt: dto.spentAt ?? today(),
    });
    await this.expenses.save(expense);
    return toDto(expense);
  }

  async findAll(
    ownerId: string,
    range?: { from?: string; to?: string },
  ): Promise<ExpenseDto[]> {
    const expenses = await this.expenses.find({
      where: {
        ownerId,
        ...spentAtWhere(range),
      },
      order: { spentAt: 'DESC', createdAt: 'DESC' },
    });
    return expenses.map(toDto);
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    const expense = await this.getOwned(ownerId, id);
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.category !== undefined) expense.category = dto.category;
    // `note` present (even as "") means "set it" — an emptied note clears to null.
    if (dto.note !== undefined) expense.note = normalizeNote(dto.note);
    if (dto.spentAt !== undefined) expense.spentAt = dto.spentAt;
    await this.expenses.save(expense);
    return toDto(expense);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const expense = await this.getOwned(ownerId, id);
    await this.expenses.remove(expense);
  }

  /** Sum of expense amounts in an inclusive [from, to] date range. */
  async totalForRange(
    ownerId: string,
    from: string,
    to: string,
  ): Promise<number> {
    const raw = await this.expenses
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount), 0)', 'sum')
      .where('e.owner_id = :ownerId', { ownerId })
      .andWhere('e.spent_at BETWEEN :from AND :to', { from, to })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum) || 0;
  }

  /** Fetch an expense, asserting it belongs to this owner (else 404). */
  private async getOwned(ownerId: string, id: string): Promise<Expense> {
    const expense = await this.expenses.findOne({ where: { id, ownerId } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}

/** Today as an ISO date string (YYYY-MM-DD), server local time — matches the
 *  day boundaries used by the orders stats aggregation. */
function today(): string {
  return localDateKey(new Date());
}

/** Normalize an optional note: blank/whitespace-only becomes null. */
function normalizeNote(note?: string | null): string | null {
  return note?.trim() ? note.trim() : null;
}

/** Build the optional spentAt date filter for findAll, honouring an open-ended
 *  range (from-only or to-only) as well as a bounded one. */
function spentAtWhere(range?: { from?: string; to?: string }) {
  const { from, to } = range ?? {};
  if (from && to) return { spentAt: Between(from, to) };
  if (from) return { spentAt: MoreThanOrEqual(from) };
  if (to) return { spentAt: LessThanOrEqual(to) };
  return {};
}

function toDto(e: Expense): ExpenseDto {
  return {
    id: e.id,
    amount: e.amount,
    category: e.category,
    note: e.note,
    spentAt: e.spentAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
