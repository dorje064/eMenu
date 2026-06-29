import { apiRequest } from './client';
import type { CreateOrderInput, Order } from './types';

export const ordersApi = {
  create: (input: CreateOrderInput) =>
    apiRequest<Order>('/public/orders', { method: 'POST', body: input }),
};
