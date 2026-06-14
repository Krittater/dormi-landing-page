'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiFetch, ApiError } from '@/lib/api';
import { clearToken, getToken } from '@/lib/session';

interface Overview {
  totalRegistrations: number;
  registrationsToday: number;
  registrations7d: number;
  totalSectionViews: number;
  totalButtonClicks: number;
  uniqueVisitors7d: number;
}

interface TopRow {
  target: string;
  label?: string | null;
  count: number;
}

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  ipAddress: string | null;
  createdAt: string;
}

interface RegList {
  items: Registration[];
  total: number;
  page: number;
  pageSize: number;
}

interface AdminProfile {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topSections, setTopSections] = useState<TopRow[]>([]);
  const [topButtons, setTopButtons] = useState<TopRow[]>([]);
  const [regs, setRegs] = useState<RegList | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/admin/login');
      return;
    }
    setTokenState(t);
  }, [router]);

  const loadAll = useCallback(
    async (currentToken: string, opts?: { page?: number; search?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (opts?.search) qs.set('search', opts.search);
        qs.set('page', String(opts?.page ?? page));
        qs.set('pageSize', '10');

        const [me, ov, ts, tb, rg] = await Promise.all([
          apiFetch<AdminProfile>('/auth/me', { token: currentToken }),
          apiFetch<Overview>('/dashboard/overview', { token: currentToken }),
          apiFetch<TopRow[]>('/dashboard/top-sections?limit=10', { token: currentToken }),
          apiFetch<TopRow[]>('/dashboard/top-buttons?limit=10', { token: currentToken }),
          apiFetch<RegList>(`/registrations?${qs.toString()}`, { token: currentToken }),
        ]);
        setProfile(me);
        setOverview(ov);
        setTopSections(ts);
        setTopButtons(tb);
        setRegs(rg);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace('/admin/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    },
    [page, router],
  );

  useEffect(() => {
    if (!token) return;
    void loadAll(token);
  }, [token, loadAll]);

  function logout() {
    clearToken();
    router.replace('/admin/login');
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPage(1);
    void loadAll(token, { page: 1, search });
  }

  const maxSection = useMemo(
    () => Math.max(1, ...topSections.map((s) => s.count)),
    [topSections],
  );
  const maxButton = useMemo(
    () => Math.max(1, ...topButtons.map((s) => s.count)),
    [topButtons],
  );

  if (!token) return null;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 border-b border-secondary/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-secondary sm:text-xl"
          >
            dormi<span className="text-ink"> Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium text-ink">{profile?.name ?? profile?.email}</div>
              <div className="text-ink-muted">{profile?.role}</div>
            </div>
            <button onClick={logout} className="btn-outline px-4 py-2 text-sm">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            แดชบอร์ดผู้ดูแล
          </h1>
          <p className="text-sm text-ink-muted">
            ภาพรวมการลงทะเบียน, section ที่ถูกดูมากที่สุด และปุ่มที่ถูกกดมากที่สุด
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="ผู้ลงทะเบียนทั้งหมด" value={overview?.totalRegistrations} tone="primary" />
          <KpiCard label="ลงทะเบียนวันนี้" value={overview?.registrationsToday} />
          <KpiCard label="7 วันล่าสุด" value={overview?.registrations7d} />
          <KpiCard label="Section views (รวม)" value={overview?.totalSectionViews} />
          <KpiCard label="Button clicks (รวม)" value={overview?.totalButtonClicks} />
          <KpiCard label="Visitor 7 วัน (IP)" value={overview?.uniqueVisitors7d} />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel
            title="Section ที่ถูกดูมากที่สุด"
            subtitle="Top 10 (ตามจำนวน SECTION_VIEW)"
            empty={topSections.length === 0 && !loading}
          >
            <ul className="space-y-2.5">
              {topSections.map((s, i) => (
                <Bar
                  key={s.target}
                  rank={i + 1}
                  name={s.label || s.target}
                  sub={s.target}
                  count={s.count}
                  ratio={s.count / maxSection}
                />
              ))}
            </ul>
          </Panel>

          <Panel
            title="ปุ่มที่ถูกกดมากที่สุด"
            subtitle="Top 10 (ตามจำนวน BUTTON_CLICK)"
            empty={topButtons.length === 0 && !loading}
          >
            <ul className="space-y-2.5">
              {topButtons.map((s, i) => (
                <Bar
                  key={s.target}
                  rank={i + 1}
                  name={s.label || s.target}
                  sub={s.target}
                  count={s.count}
                  ratio={s.count / maxButton}
                />
              ))}
            </ul>
          </Panel>
        </section>

        <section className="rounded-2xl border border-secondary/12 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">รายชื่อผู้ลงทะเบียน</h2>
              <p className="text-xs text-ink-muted">
                ทั้งหมด {regs?.total ?? '—'} รายการ
              </p>
            </div>
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร"
                className="w-56 rounded-lg border border-secondary/20 bg-secondary-muted px-3 py-2 text-sm text-ink outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 sm:w-72"
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm">
                ค้นหา
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-secondary/12 text-left text-xs uppercase text-ink-muted">
                  <th className="px-3 py-2 font-medium">ชื่อ-นามสกุล</th>
                  <th className="px-3 py-2 font-medium">เบอร์โทร</th>
                  <th className="px-3 py-2 font-medium">อีเมล</th>
                  <th className="px-3 py-2 font-medium">IP</th>
                  <th className="px-3 py-2 font-medium">วันเวลา</th>
                </tr>
              </thead>
              <tbody>
                {regs?.items?.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-secondary/10 hover:bg-secondary/[0.04]"
                  >
                    <td className="px-3 py-3 font-medium text-ink">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{r.phone}</td>
                    <td className="px-3 py-3 text-ink-muted">{r.email ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-ink-muted">{r.ipAddress ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-ink-muted">
                      {new Date(r.createdAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}
                {!loading && regs && regs.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-ink-muted">
                      ยังไม่มีผู้ลงทะเบียน
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-ink-muted">
                      กำลังโหลด…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {regs && regs.total > regs.pageSize && (
            <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
              <div>
                หน้า {regs.page} / {Math.ceil(regs.total / regs.pageSize)}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={regs.page <= 1 || loading}
                  onClick={() => {
                    if (!token) return;
                    const newPage = regs.page - 1;
                    setPage(newPage);
                    void loadAll(token, { page: newPage, search });
                  }}
                  className="rounded-md border border-secondary/15 bg-white px-3 py-1.5 text-xs text-ink disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  disabled={regs.page >= Math.ceil(regs.total / regs.pageSize) || loading}
                  onClick={() => {
                    if (!token) return;
                    const newPage = regs.page + 1;
                    setPage(newPage);
                    void loadAll(token, { page: newPage, search });
                  }}
                  className="rounded-md border border-secondary/15 bg-white px-3 py-1.5 text-xs text-ink disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone?: 'primary';
}) {
  return (
    <div className="rounded-xl border border-secondary/12 bg-white p-4 shadow-sm">
      <div className="text-[11px] text-ink-muted">{label}</div>
      <div
        className={`mt-1 font-display text-2xl font-bold ${
          tone === 'primary' ? 'text-secondary' : 'text-ink'
        }`}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  empty,
  children,
}: {
  title: string;
  subtitle?: string;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary/12 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {empty ? (
        <div className="py-8 text-center text-sm text-ink-muted">ยังไม่มีข้อมูล</div>
      ) : (
        children
      )}
    </div>
  );
}

function Bar({
  rank,
  name,
  sub,
  count,
  ratio,
}: {
  rank: number;
  name: string;
  sub: string;
  count: number;
  ratio: number;
}) {
  return (
    <li>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-bold text-secondary">
            {rank}
          </span>
          <span className="truncate font-medium text-ink">{name}</span>
          <span className="hidden truncate text-xs text-ink-muted sm:inline">· {sub}</span>
        </div>
        <span className="shrink-0 text-sm font-semibold text-secondary">{count.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-secondary/60 to-secondary"
          style={{ width: `${Math.max(2, ratio * 100)}%` }}
        />
      </div>
    </li>
  );
}
