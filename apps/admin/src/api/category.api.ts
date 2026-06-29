import { apiRequest } from './client';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types';

export const categoryApi = {
  list: (activeOnly?: boolean) =>
    apiRequest<Category[]>(
      `/categories${activeOnly ? '?activeOnly=true' : ''}`
    ),

  get: (id: string) => apiRequest<Category>(`/categories/${id}`),

  create: (input: CreateCategoryInput) =>
    apiRequest<Category>('/categories', {
      method: 'POST',
      body: input,
      auth: true,
    }),

  update: (id: string, input: UpdateCategoryInput) =>
    apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/categories/${id}`, { method: 'DELETE', auth: true }),
};
