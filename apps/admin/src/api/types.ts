/** Shapes mirrored from the eMenu NestJS API DTOs. */

/** Account access level. Owners have full access; staff are limited by role. */
export type UserRole = 'owner' | 'kitchen' | 'waiter';

/** Roles an owner can assign to staff. */
export type StaffRole = Exclude<UserRole, 'owner'>;

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  /** Employing owner's id for staff; null for owners. */
  ownerId: string | null;
  createdAt: string;
}

/** A staff member managed by an owner. */
export interface Staff {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

export interface CreateStaffInput {
  email: string;
  fullName: string;
  role: StaffRole;
  password: string;
}

export interface UpdateStaffInput {
  role?: StaffRole;
  active?: boolean;
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
export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'served'
  | 'paid'
  | 'cancelled';

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

/** A business expense recorded by the café owner. */
export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  /** Day incurred (ISO date, YYYY-MM-DD). */
  spentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: number;
  category: string;
  note?: string;
  spentAt?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

/** One day's total paid sales in the dashboard's 30-day series. */
export interface SalesByDay {
  date: string;
  total: number;
}

/** A best-selling item across paid orders. */
export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

/** Aggregated figures backing the owner dashboard (paid orders only). */
export interface DashboardStats {
  salesToday: number;
  expensesToday: number;
  netIncome: number;
  salesByDay: SalesByDay[];
  topItems: TopItem[];
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
