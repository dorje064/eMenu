import { apiRequest } from './client';
import type { CreateFoodItemInput, FoodItem } from './types';

export const menuApi = {
  list: (category?: string) =>
    apiRequest<FoodItem[]>(
      `/menu/items${category ? `?category=${encodeURIComponent(category)}` : ''}`
    ),

  get: (id: string) => apiRequest<FoodItem>(`/menu/items/${id}`),

  create: (input: CreateFoodItemInput) =>
    apiRequest<FoodItem>('/menu/items', {
      method: 'POST',
      body: input,
      auth: true,
    }),
};
