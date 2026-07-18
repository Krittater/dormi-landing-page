'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { AdminNav } from '@/components/admin/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  dormiApi,
  DormiApiError,
  type AdminCustomer,
  type AdminCustomerList,
  type AdminPlan,
  type CreatedCustomer,
} from '@/lib/dormi-api';
import { getToken } from '@/lib/session';

interface ProvisionForm {
  email: string;
  phone: string;
  firstNameTH: string;
  lastNameTH: string;
  planCode: string;
  note: string;
  leadRef: string;
}

const EMPTY_PROVISION: ProvisionForm = {
  email: '',
  phone: '',
  firstNameTH: '',
  lastNameTH: '',
  planCode: '',
  note: '',
  leadRef: '',
};

/** จัดการลูกค้า dormi: ดูแผน/โควตา + assign แผน (manual) + ระงับบัญชี — เรียก backend-2 ด้วย SSO token */
export default function AdminCustomersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<AdminCustomerList | null>(null);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // dialog เปลี่ยนแผน
  const [target, setTarget] = useState<AdminCustomer | null>(null);
  const [planCode, setPlanCode] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // dialog สร้างลูกค้า (provision จาก lead หรือกรอกใหม่)
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [provision, setProvision] = useState<ProvisionForm>(EMPTY_PROVISION);
  const [provisioning, setProvisioning] = useState(false);
  const [created, setCreated] = useState<CreatedCustomer | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);

    // prefill จากปุ่ม "สร้างลูกค้า" บนตาราง lead (dashboard)
    const params = new URLSearchParams(window.location.search);
    if (params.get('provision') === '1') {
      setProvision({
        email: params.get('email') ?? '',
        phone: params.get('phone') ?? '',
        firstNameTH: params.get('firstNameTH') ?? '',
        lastNameTH: params.get('lastNameTH') ?? '',
        planCode: params.get('planCode') ?? '',
        note: '',
        leadRef: params.get('leadRef') ?? '',
      });
      setProvisionOpen(true);
      window.history.replaceState(null, '', '/admin/customers');
    }
  }, [router]);

  const load = useCallback(
    async (opts?: { page?: number; search?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const [customers, planList] = await Promise.all([
          dormiApi.admin.customers({
            search: opts?.search ?? search,
            page: opts?.page ?? page,
            limit: 20,
          }),
          dormiApi.admin.plans(),
        ]);
        setList(customers);
        setPlans(planList.filter((p) => p.isActive));
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
    // search/page อ่านค่า ณ ตอนเรียก — ส่งผ่าน opts เสมอเมื่อเปลี่ยน
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  useEffect(() => {
    if (ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load({ page: 1, search });
  };

  const openAssign = (customer: AdminCustomer) => {
    setTarget(customer);
    setPlanCode(customer.plan.code ?? '');
    setNote('');
  };

  const assign = async () => {
    if (!target || !planCode) return;
    setSaving(true);
    try {
      await dormiApi.admin.assignSubscription(target.userId, {
        planCode,
        note: note || undefined,
      });
      setTarget(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เปลี่ยนแผนไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const submitProvision = async () => {
    if (!provision.email || !provision.phone) return;
    setProvisioning(true);
    setError(null);
    try {
      const res = await dormiApi.admin.createCustomer({
        email: provision.email,
        phone: provision.phone,
        firstNameTH: provision.firstNameTH || undefined,
        lastNameTH: provision.lastNameTH || undefined,
        planCode: provision.planCode || undefined,
        leadRef: provision.leadRef || undefined,
        note: provision.note || undefined,
      });
      const data = (res as { data?: CreatedCustomer }).data ?? (res as CreatedCustomer);
      setCreated(data);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างลูกค้าไม่สำเร็จ');
    } finally {
      setProvisioning(false);
    }
  };

  const closeProvision = () => {
    setProvisionOpen(false);
    setCreated(null);
    setProvision(EMPTY_PROVISION);
  };

  const toggleStatus = async (customer: AdminCustomer) => {
    const next = customer.status === 'active' ? 'suspended' : 'active';
    try {
      await dormiApi.admin.setCustomerStatus(customer.userId, next);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink">ลูกค้า</h1>
            <Button size="sm" onClick={() => setProvisionOpen(true)}>
              + สร้างลูกค้า
            </Button>
          </div>
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ / อีเมล / เบอร์"
                className="w-64 pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              ค้นหา
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
                <TableHead>ลูกค้า</TableHead>
                <TableHead>แผน</TableHead>
                <TableHead className="text-right">ห้องที่ใช้</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (list?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-ink-muted">
                    ไม่พบลูกค้า
                  </TableCell>
                </TableRow>
              ) : (
                list!.items.map((c) => (
                  <TableRow key={c.userId}>
                    <TableCell>
                      <div className="font-medium text-ink">{c.name ?? '-'}</div>
                      <div className="text-xs text-ink-muted">
                        {c.email} · {c.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.plan.source === 'subscription' ? 'default' : 'secondary'}>
                        {c.plan.code ?? '-'}
                      </Badge>
                      {c.plan.source === 'default' && (
                        <span className="ml-2 text-xs text-ink-muted">(ยังไม่ได้ assign)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.usage.rooms}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'active' ? 'success' : 'danger'}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAssign(c)}>
                          เปลี่ยนแผน
                        </Button>
                        <Button
                          size="sm"
                          variant={c.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => void toggleStatus(c)}
                        >
                          {c.status === 'active' ? 'ระงับ' : 'เปิดใช้'}
                        </Button>
                      </div>
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

      <Dialog open={provisionOpen} onOpenChange={(open) => !open && closeProvision()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {created ? 'สร้างลูกค้าสำเร็จ' : 'สร้างลูกค้าใหม่ (provision)'}
            </DialogTitle>
          </DialogHeader>
          {created ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-muted">
                บัญชี <span className="font-medium text-ink">{created.email}</span> ถูกสร้างเป็น
                OWNER{created.plan ? ` พร้อมแผน ${created.plan.planCode}` : ''} เรียบร้อย
              </p>
              {created.initialPassword && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                  <div className="text-xs font-medium text-amber-800">
                    รหัสผ่านชั่วคราว — แสดงครั้งเดียว ส่งให้ลูกค้าแล้วแนะนำให้เปลี่ยนทันที
                  </div>
                  <code className="mt-1 block select-all font-mono text-base text-amber-900">
                    {created.initialPassword}
                  </code>
                </div>
              )}
              <DialogFooter>
                <Button onClick={closeProvision}>ปิด</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ชื่อ</Label>
                    <Input
                      value={provision.firstNameTH}
                      onChange={(e) =>
                        setProvision((p) => ({ ...p, firstNameTH: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>นามสกุล</Label>
                    <Input
                      value={provision.lastNameTH}
                      onChange={(e) =>
                        setProvision((p) => ({ ...p, lastNameTH: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>อีเมล *</Label>
                  <Input
                    type="email"
                    value={provision.email}
                    onChange={(e) => setProvision((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทร *</Label>
                  <Input
                    value={provision.phone}
                    onChange={(e) => setProvision((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="0812345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>แผนตั้งต้น</Label>
                  <Select
                    value={provision.planCode}
                    onValueChange={(v) => setProvision((p) => ({ ...p, planCode: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ไม่ระบุ = แผน default (FREE)" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.planId} value={p.code}>
                          {p.code} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>บันทึก</Label>
                  <Input
                    value={provision.note}
                    onChange={(e) => setProvision((p) => ({ ...p, note: e.target.value }))}
                    placeholder="เช่น จาก lead วันที่ 18 ก.ค."
                  />
                </div>
                {provision.leadRef && (
                  <p className="text-xs text-ink-muted">อ้างอิง lead: {provision.leadRef}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeProvision}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={() => void submitProvision()}
                  disabled={provisioning || !provision.email || !provision.phone}
                >
                  {provisioning ? 'กำลังสร้าง…' : 'สร้างลูกค้า'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนแผน — {target?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>แผน</Label>
              <Select value={planCode} onValueChange={setPlanCode}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแผน" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.planId} value={p.code}>
                      {p.code} — {p.name}
                      {p.priceMonthly ? ` (฿${p.priceMonthly}/เดือน)` : ' (ฟรี)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>บันทึก (เหตุผล/อ้างอิงการชำระเงิน)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ชำระผ่านโอน 17 ก.ค. 2569"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              ยกเลิก
            </Button>
            <Button onClick={() => void assign()} disabled={saving || !planCode}>
              {saving ? 'กำลังบันทึก…' : 'ยืนยันเปลี่ยนแผน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
