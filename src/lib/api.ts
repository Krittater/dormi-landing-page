export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5001';

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
  }
}

interface RequestOpts extends Omit<RequestInit, 'body'> {
  json?: unknown;
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { json, token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const raw =
      data && typeof data === 'object'
        ? (data as { message?: string | string[] }).message
        : undefined;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string' && raw.length > 0
      ? raw
      : `API ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
