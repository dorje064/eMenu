/**
 * Tiny fetch wrapper around the eMenu API.
 * - Base URL defaults to `/api` (proxied to the NestJS server in dev).
 * - Attaches the bearer token from a pluggable token provider.
 * - Normalizes errors into `ApiError` with the server's message(s).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
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

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenProvider();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Network error — is the API running on :3000?');
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const msg = (data as { message?: unknown }).message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return null;
}
