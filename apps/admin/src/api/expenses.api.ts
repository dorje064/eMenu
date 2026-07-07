import { apiRequest } from './client';
import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from './types';

export const expensesApi = {
  /** List the café's expenses, newest first. Optionally within an inclusive
   *  [from, to] date range (ISO dates). */
  list: (range?: { from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (range?.from) params.set('from', range.from);
    if (range?.to) params.set('to', range.to);
    const qs = params.toString();
    return apiRequest<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`, {
      auth: true,
    });
  },

  create: (input: CreateExpenseInput) =>
    apiRequest<Expense>('/expenses', {
      method: 'POST',
      body: input,
      auth: true,
    }),

  update: (id: string, input: UpdateExpenseInput) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/expenses/${id}`, { method: 'DELETE', auth: true }),
};
