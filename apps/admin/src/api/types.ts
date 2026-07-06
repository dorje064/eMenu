/** Shapes mirrored from the eMenu NestJS API DTOs. */

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  customer: Customer;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  prepTimeMinutes: number;
  imageUrl: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodItemInput {
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTimeMinutes?: number;
  imageUrl?: string;
  available?: boolean;
}

export type UpdateFoodItemInput = Partial<CreateFoodItemInput>;

export interface RestaurantTable {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableInput {
  name: string;
  active?: boolean;
}

export type UpdateTableInput = Partial<CreateTableInput>;

/** Menu layouts the customer app can render. */
export type MenuTemplate = 'classic' | 'showcase' | 'grid';

export interface Settings {
  id: string;
  menuTemplate: MenuTemplate;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  menuTemplate: MenuTemplate;
}

/** One image-search hit shown in the picker grid. */
export interface ImageSearchResult {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  alt: string | null;
  credit: string;
  sourceUrl: string;
}

/** Result of uploading an image to the API. */
export interface UploadResult {
  imageUrl: string;
}

/** Order lifecycle states, mirrored from the API's ORDER_STATUSES. */
export type OrderStatus = 'pending' | 'preparing' | 'served' | 'cancelled';

/** One line on an order — name/price are snapshotted at order time. */
export interface OrderItemLine {
  id: string;
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: OrderStatus;
  note: string | null;
  total: number;
  items: OrderItemLine[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
