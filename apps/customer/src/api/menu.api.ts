import { apiRequest } from './client';
import type { PublicMenu } from './types';

export const menuApi = {
  /** Fetch a single café's menu (categories, items, template). */
  forCafe: (cafeId: string) =>
    apiRequest<PublicMenu>(
      `/public/menu?cafe=${encodeURIComponent(cafeId)}`
    ),
};
