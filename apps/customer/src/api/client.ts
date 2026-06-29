/**
 * Tiny axios wrapper around the eMenu API for the public customer app.
 * - Base URL defaults to `/api` (proxied to the NestJS server in dev).
 * - No auth: every customer endpoint used here is public.
 * - Normalizes errors into `ApiError` with the server's message(s).
 */
import axios, { AxiosError, type AxiosInstance } from 'axios';

function normalizeBaseUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return '/api';
  if (value.startsWith('/')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `http://${value}`;
}

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const http: AxiosInstance = axios.create({ baseURL: BASE_URL });

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {}
): Promise<T> {
  try {
    const res = await http.request<T>({ url: path, method, data: body });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const { response } = err as AxiosError;
    if (response) {
      const message =
        extractMessage(response.data) ?? `Request failed (${response.status})`;
      return new ApiError(response.status, message);
    }
    return new ApiError(0, 'Network error — is the API running on :3000?');
  }
  return new ApiError(0, 'Unexpected error');
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const msg = (data as { message?: unknown }).message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return null;
}
