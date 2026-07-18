'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiFetch, ApiError } from '@/lib/api';
import { getToken, setToken } from '@/lib/session';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; name?: string; role: string };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // login แล้ว = ไม่ต้องเห็นหน้านี้อีก — เด้งเข้า dashboard จนกว่าจะ logout
  useEffect(() => {
    if (getToken()) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        json: { email, password },
      });
      setToken(res.accessToken);
      router.push('/admin/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-secondary/20 bg-white p-7 shadow-mockup sm:p-9">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-bold tracking-tight text-secondary"
          >
            dormi<span className="text-ink"> Link and Rent</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Admin Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">เข้าสู่ระบบสำหรับผู้ดูแลเท่านั้น</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-secondary/20 bg-secondary-muted px-3 py-2.5 text-sm text-ink outline-hidden transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-secondary/20 bg-secondary-muted px-3 py-2.5 text-sm text-ink outline-hidden transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          กลับสู่ <Link href="/" className="text-secondary hover:underline">หน้าแรก</Link>
        </p>
      </div>
    </div>
  );
}
