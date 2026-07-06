/**
 * Tiny axios wrapper around the eMenu API.
 * - Base URL defaults to `/api` (proxied to the NestJS server in dev).
 * - Attaches the bearer token from a pluggable token provider.
 * - Normalizes errors into `ApiError` with the server's message(s).
 */
import axios, { AxiosError, type AxiosInstance } from 'axios';

/**
 * Resolve the configured base URL into something axios accepts.
 * - empty/unset            → '/api' (relative, hits the Vite dev proxy)
 * - relative path ('/api') → used as-is
 * - full URL ('http://…')  → used as-is
 * - schemeless host        → prefixed with 'http://' so axios doesn't read
 *                            'localhost:' as an (unsupported) protocol.
 */
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
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let tokenProvider: () => string | null = () => null;

/** Register how the client obtains the current auth token (set by AuthProvider). */
export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

const http: AxiosInstance = axios.create({ baseURL: BASE_URL });

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = tokenProvider();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await http.request<T>({
      url: path,
      method,
      headers,
      data: body,
    });
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
    // No response → connection refused, DNS failure, CORS, etc.
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
