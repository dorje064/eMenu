import { apiRequest } from './client';
import type { Order, OrderStatus } from './types';

export const ordersApi = {
  /** List the café's orders, newest first. Optionally filter by status. */
  list: (status?: OrderStatus) =>
    apiRequest<Order[]>(
      status ? `/orders?status=${encodeURIComponent(status)}` : '/orders',
      { auth: true },
    ),

  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
      auth: true,
    }),
};
