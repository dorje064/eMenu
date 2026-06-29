import { apiRequest } from './client';
import type { Category, FoodItem, Settings } from './types';

export const menuApi = {
  items: () => apiRequest<FoodItem[]>('/menu/items'),

  categories: () => apiRequest<Category[]>('/categories?activeOnly=true'),

  settings: () => apiRequest<Settings>('/settings'),
};
