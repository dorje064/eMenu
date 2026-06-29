import { apiRequest } from './client';
import type {
  CreateFoodItemInput,
  FoodItem,
  ImageSearchResult,
  UpdateFoodItemInput,
  UploadResult,
} from './types';

export const menuApi = {
  list: (category?: string) =>
    apiRequest<FoodItem[]>(
      `/menu/items${category ? `?category=${encodeURIComponent(category)}` : ''}`,
      { auth: true },
    ),

  get: (id: string) =>
    apiRequest<FoodItem>(`/menu/items/${id}`, { auth: true }),

  create: (input: CreateFoodItemInput) =>
    apiRequest<FoodItem>('/menu/items', {
      method: 'POST',
      body: input,
      auth: true,
    }),

  update: (id: string, input: UpdateFoodItemInput) =>
    apiRequest<FoodItem>(`/menu/items/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/menu/items/${id}`, { method: 'DELETE', auth: true }),

  /** Search stock images (proxied to Unsplash via the API). */
  searchImages: (query: string) =>
    apiRequest<ImageSearchResult[]>(
      `/menu/image-search?q=${encodeURIComponent(query)}`,
    ),

  /** Upload a local image file; returns the stored image URL. */
  uploadImage: (file: File) => {
    const data = new FormData();
    data.append('file', file);
    return apiRequest<UploadResult>('/menu/upload', {
      method: 'POST',
      body: data,
      auth: true,
    });
  },
};
