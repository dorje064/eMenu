import { apiRequest } from './client';
import type {
  CreateTableInput,
  RestaurantTable,
  UpdateTableInput,
} from './types';

export const tablesApi = {
  list: () => apiRequest<RestaurantTable[]>('/tables', { auth: true }),

  create: (input: CreateTableInput) =>
    apiRequest<RestaurantTable>('/tables', {
      method: 'POST',
      body: input,
      auth: true,
    }),

  update: (id: string, input: UpdateTableInput) =>
    apiRequest<RestaurantTable>(`/tables/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/tables/${id}`, { method: 'DELETE', auth: true }),
};
