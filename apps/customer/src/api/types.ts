/** Shapes mirrored from the eMenu NestJS API DTOs (public subset). */

export type MenuTemplate = 'classic' | 'showcase' | 'grid';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  prepTimeMinutes: number;
  imageUrl: string | null;
  available: boolean;
}

export interface Settings {
  id: string;
  menuTemplate: MenuTemplate;
  updatedAt: string;
}

export interface OrderLineInput {
  foodItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  tableNumber: string;
  items: OrderLineInput[];
  note?: string;
}

export interface OrderItem {
  id: string;
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: string;
  note: string | null;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
