import { apiRequest } from './client';
import type {
  AdjustInventoryInput,
  CreateInventoryInput,
  InventoryItem,
  UpdateInventoryInput,
} from './types';

export const inventoryApi = {
  /** List the café's inventory items, ordered by name. */
  list: () => apiRequest<InventoryItem[]>('/inventory', { auth: true }),

  create: (input: CreateInventoryInput) =>
    apiRequest<InventoryItem>('/inventory', {
      method: 'POST',
      body: input,
      auth: true,
    }),

  update: (id: string, input: UpdateInventoryInput) =>
    apiRequest<InventoryItem>(`/inventory/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  /** Apply a manual signed adjustment (restock / waste / correction). */
  adjust: (id: string, input: AdjustInventoryInput) =>
    apiRequest<InventoryItem>(`/inventory/${id}/adjust`, {
      method: 'POST',
      body: input,
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/inventory/${id}`, { method: 'DELETE', auth: true }),
};
