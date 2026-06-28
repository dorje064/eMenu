import { apiRequest } from './client';
import type { Category, CreateCategoryInput } from './types';

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
};
