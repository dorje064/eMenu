import { apiRequest } from './client';
import type { DashboardStats, Order, OrderStatus } from './types';

export const ordersApi = {
  /** Aggregated dashboard stats: today's sales, 30-day series, top items. */
  stats: () => apiRequest<DashboardStats>('/orders/stats', { auth: true }),

  /** List the café's orders, newest first. Optionally filter by status and/or
   *  the table the order was placed from. */
  list: (filters?: { status?: OrderStatus; table?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.table) params.set('table', filters.table);
    const qs = params.toString();
    return apiRequest<Order[]>(`/orders${qs ? `?${qs}` : ''}`, { auth: true });
  },

  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
      auth: true,
    }),

  /** Merge several same-table orders into a single order. */
  merge: (orderIds: string[]) =>
    apiRequest<Order>('/orders/merge', {
      method: 'POST',
      body: { orderIds },
      auth: true,
    }),
};
