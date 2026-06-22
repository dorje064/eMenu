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
