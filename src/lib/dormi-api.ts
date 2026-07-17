import { getToken } from '@/lib/session';

/**
 * เรียก dormi-backend-2 (คนละ service กับ dormi-admin ที่ lib/api.ts ใช้)
 * - public: หน้า pricing (GET /public/plans)
 * - admin: จัดการลูกค้า/แผน — ใช้ SSO token เดียวกับที่ login dormi-admin (B1)
 */
export const DORMI_API_URL =
  process.env.NEXT_PUBLIC_DORMI_API_URL?.replace(/\/$/, '') ??
  'http://localhost:7654';

export class DormiApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
  }
}

interface RequestOpts extends Omit<RequestInit, 'body'> {
  json?: unknown;
  /** แนบ SSO token จาก localStorage (สำหรับ /admin/*) */
  auth?: boolean;
}

export async function dormiFetch<T = unknown>(
  path: string,
  opts: RequestOpts = {},
): Promise<T> {
  const { json, auth, headers, ...rest } = opts;
  const token = auth ? getToken() : null;

  const res = await fetch(`${DORMI_API_URL}${path}`, {
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
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

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
    throw new DormiApiError(res.status, message, data);
  }

  // backend-2 ห่อ response เป็น { code, success, data, message }
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

// ── types ตาม response จริงของ backend-2 ──

export interface PublicPlan {
  code: string;
  name: string;
  description: string | null;
  priceMonthly: string | null;
  priceYearly: string | null;
  currency: string;
  features: string[];
  limits: Record<string, number | null>;
}

export interface AdminCustomer {
  userId: string;
  email: string;
  phone: string;
  name: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
  plan: { code: string | null; name: string | null; source: string };
  usage: { rooms: number };
}

export interface AdminCustomerList {
  items: AdminCustomer[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminPlan {
  planId: string;
  code: string;
  name: string;
  description: string | null;
  priceMonthly: string | null;
  priceYearly: string | null;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  features?: string[];
  limits?: Record<string, number | null>;
  subscribers?: number;
}

export const dormiApi = {
  publicPlans: () => dormiFetch<PublicPlan[]>('/public/plans'),

  admin: {
    customers: (params?: { search?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const suffix = qs.size > 0 ? `?${qs.toString()}` : '';
      return dormiFetch<AdminCustomerList>(`/admin/customers${suffix}`, {
        auth: true,
      });
    },
    assignSubscription: (
      userId: string,
      body: { planCode: string; endsAt?: string; note?: string },
    ) =>
      dormiFetch(`/admin/customers/${userId}/subscription`, {
        method: 'POST',
        json: body,
        auth: true,
      }),
    setCustomerStatus: (userId: string, status: string) =>
      dormiFetch(`/admin/customers/${userId}/status`, {
        method: 'PATCH',
        json: { status },
        auth: true,
      }),
    plans: () => dormiFetch<AdminPlan[]>('/admin/plans', { auth: true }),
    updatePlan: (
      planId: string,
      body: Partial<
        Pick<
          AdminPlan,
          'name' | 'description' | 'priceMonthly' | 'priceYearly' | 'isActive' | 'sortOrder'
        >
      >,
    ) =>
      dormiFetch(`/admin/plans/${planId}`, {
        method: 'PATCH',
        json: body,
        auth: true,
      }),
    setPlanFeatures: (planId: string, features: string[]) =>
      dormiFetch(`/admin/plans/${planId}/features`, {
        method: 'PUT',
        json: { features },
        auth: true,
      }),
    setPlanLimits: (
      planId: string,
      limits: Array<{ key: string; value: number | null }>,
    ) =>
      dormiFetch(`/admin/plans/${planId}/limits`, {
        method: 'PUT',
        json: { limits },
        auth: true,
      }),
  },
};
