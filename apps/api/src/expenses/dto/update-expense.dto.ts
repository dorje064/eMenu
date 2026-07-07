import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

/** All fields optional — patch an existing expense. */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
