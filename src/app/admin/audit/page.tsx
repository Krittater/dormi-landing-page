'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dormiApi, DormiApiError, type AuditLogList } from '@/lib/dormi-api';
import { getToken } from '@/lib/session';

/** system audit viewer — ใครเปลี่ยน plan/subscription/role/ลูกค้า เมื่อไหร่ (อ่านอย่างเดียว) */
export default function AdminAuditPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<AuditLogList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [actorEmail, setActorEmail] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(
    async (opts?: { page?: number; action?: string; actorEmail?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await dormiApi.admin.auditLogs({
          page: opts?.page ?? page,
          limit: 30,
          action: (opts?.action ?? action) || undefined,
          actorEmail: (opts?.actorEmail ?? actorEmail) || undefined,
        });
        setList(data);
      } catch (err) {
        if (err instanceof DormiApiError && err.status === 401) {
          router.replace('/admin/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    },
    // page/action/actorEmail อ่าน ณ ตอนเรียก — ส่งผ่าน opts เมื่อเปลี่ยน
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  useEffect(() => {
    if (ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const submitFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load({ page: 1, action, actorEmail });
  };

  const rowKey = (i: number) => `${list?.pagination.page ?? 0}-${i}`;

  return !ready ? null : (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-ink">Audit log</h1>
          <form onSubmit={submitFilter} className="flex flex-wrap items-center gap-2">
            <Input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="กรอง action เช่น subscription"
              className="w-52"
            />
            <Input
              value={actorEmail}
              onChange={(e) => setActorEmail(e.target.value)}
              placeholder="กรอง email ผู้กระทำ"
              className="w-52"
            />
            <Button type="submit" variant="outline">
              กรอง
            </Button>
          </form>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เวลา</TableHead>
                <TableHead>ผู้กระทำ</TableHead>
                <TableHead>action</TableHead>
                <TableHead>target</TableHead>
                <TableHead className="text-right">รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-7 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (list?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-ink-muted">
                    ไม่พบรายการ
                  </TableCell>
                </TableRow>
              ) : (
                list!.items.map((item, i) => (
                  <TableRow key={rowKey(i)}>
                    <TableCell className="whitespace-nowrap text-xs text-ink-muted">
                      {new Date(item.createdAt).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.actorType === 'ADMIN' ? 'default' : 'secondary'}>
                        {item.actorType}
                      </Badge>
                      <div className="mt-0.5 text-xs text-ink-muted">
                        {item.actorEmail ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{item.action}</code>
                    </TableCell>
                    <TableCell className="text-xs text-ink-muted">
                      {item.targetType}
                      {item.targetId ? ` · ${item.targetId.slice(0, 8)}…` : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpanded(expanded === rowKey(i) ? null : rowKey(i))
                        }
                      >
                        {expanded === rowKey(i) ? 'ซ่อน' : 'ดู payload'}
                      </Button>
                      {expanded === rowKey(i) && (
                        <pre className="mt-2 max-w-md overflow-x-auto rounded-lg bg-secondary/5 p-3 text-left text-xs">
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {list && list.pagination.pages > 1 && (
          <div className="flex items-center justify-end gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                void load({ page: p });
              }}
            >
              ก่อนหน้า
            </Button>
            <span className="text-ink-muted">
              หน้า {list.pagination.page} / {list.pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= list.pagination.pages}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                void load({ page: p });
              }}
            >
              ถัดไป
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
