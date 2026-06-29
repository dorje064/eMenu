import { apiRequest } from './client';
import type { Settings, UpdateSettingsInput } from './types';

export const settingsApi = {
  get: () => apiRequest<Settings>('/settings'),

  update: (input: UpdateSettingsInput) =>
    apiRequest<Settings>('/settings', {
      method: 'PATCH',
      body: input,
      auth: true,
    }),
};
