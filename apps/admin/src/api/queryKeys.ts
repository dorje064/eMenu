import type { OrderStatus } from './types';

/**
 * Centralized React Query keys so queries and the mutations that invalidate
 * them stay in sync. Each entry is a stable array prefix; passing filters
 * scopes the cache entry (and lets `invalidateQueries` match by prefix).
 */
export const queryKeys = {
  dashboardStats: ['dashboard-stats'] as const,
  tables: ['tables'] as const,
  staff: ['staff'] as const,
  settings: ['settings'] as const,
  inventory: ['inventory'] as const,
  categories: (activeOnly?: boolean) =>
    ['categories', { activeOnly: activeOnly ?? false }] as const,
  menu: (category?: string) => ['menu', { category: category ?? null }] as const,
  expenses: (range?: { from?: string; to?: string }) =>
    ['expenses', range ?? {}] as const,
  orders: (filters?: { status?: OrderStatus; table?: string }) =>
    ['orders', filters ?? {}] as const,
} as const;
