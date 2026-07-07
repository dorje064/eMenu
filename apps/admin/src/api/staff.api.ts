import { apiRequest } from './client';
import type { CreateStaffInput, Staff, UpdateStaffInput } from './types';

export const staffApi = {
  list: () => apiRequest<Staff[]>('/staff', { auth: true }),

  create: (input: CreateStaffInput) =>
    apiRequest<Staff>('/staff', { method: 'POST', body: input, auth: true }),

  update: (id: string, input: UpdateStaffInput) =>
    apiRequest<Staff>(`/staff/${id}`, {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  resetPassword: (id: string, password: string) =>
    apiRequest<Staff>(`/staff/${id}/password`, {
      method: 'PATCH',
      body: { password },
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<void>(`/staff/${id}`, { method: 'DELETE', auth: true }),
};
