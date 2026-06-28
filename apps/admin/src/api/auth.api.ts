import { apiRequest } from './client';
import type { AuthResponse, Customer, LoginInput, SignupInput } from './types';

export const authApi = {
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    }),

  signup: (input: SignupInput) =>
    apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: input }),

  me: () => apiRequest<Customer>('/auth/me', { auth: true }),
};
