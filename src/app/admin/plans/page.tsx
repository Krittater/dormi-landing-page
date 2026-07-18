'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  dormiApi,
  DormiApiError,
  type AdminPlan,
} from '@/lib/dormi-api';
import { getToken } from '@/lib/session';

/** feature ที่ระบบรองรับตอนนี้ (ตรง resource-feature-map ฝั่ง backend) — เพิ่มใหม่ = insert row ไม่ต้อง deploy */
const KNOWN_FEATURES: Array<{ code: string; label: string }> = [
  { code: 'core', label: 'พื้นฐาน (หอ/ห้อง/ผู้เช่า/มิเตอร์)' },
  { code: 'billing', label: 'ระบบบิล + รอบบิล' },
  { code: 'finance', label: 'การเงิน รายรับ-รายจ่าย' },
  { code: 'staff_roles', label: 'ตำแหน่งพนักงาน + สิทธิ์' },
];

interface EditState {
  plan: AdminPlan;
  name: string;
  priceMonthly: string; // '' = ไม่ขายตรง (null)
  roomLimit: string; // '' = ไม่จำกัด (null)
  features: Set<string>;
}

interface CreateState {
  code: string;
  name: string;
  description: string;
  priceMonthly: string;
  roomLimit: string;
  features: Set<string>;
}

const EMPTY_CREATE: CreateState = {
  code: '',
  name: '',
  description: '',
  priceMonthly: '',
  roomLimit: '',
  features: new Set(['core']),
};

/** ตั้งราคา/feature/เพดานของแต่ละแผน — ทุกการแก้มี audit ฝั่ง backend */
export default function AdminPlansPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [create, setCreate] = useState<CreateState>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  const [deleting, setDeleting] = useState<AdminPlan | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPlans(await dormiApi.admin.plans());
    } catch (err) {
      if (err instanceof DormiApiError && err.status === 401) {
        router.replace('/admin/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    }
  }, [router]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const openEdit = (plan: AdminPlan) => {
    setEdit({
      plan,
      name: plan.name,
      priceMonthly: plan.priceMonthly ?? '',
      roomLimit:
        plan.limits && plan.limits['room_limit'] !== null && plan.limits['room_limit'] !== undefined
          ? String(plan.limits['room_limit'])
          : '',
      features: new Set(plan.features ?? []),
    });
  };

  const save = async () => {
    if (!edit) return;
    setSaving(true);
    setError(null);
    try {
      await dormiApi.admin.updatePlan(edit.plan.planId, {
        name: edit.name,
        priceMonthly: edit.priceMonthly.trim() === '' ? null : edit.priceMonthly.trim(),
      });
      await dormiApi.admin.setPlanFeatures(edit.plan.planId, [...edit.features]);
      await dormiApi.admin.setPlanLimits(edit.plan.planId, [
        {
          key: 'room_limit',
          value: edit.roomLimit.trim() === '' ? null : Number(edit.roomLimit),
        },
      ]);
      setEdit(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const submitCreate = async () => {
    if (!create.code || !create.name) return;
    setCreating(true);
    setError(null);
    try {
      const res = await dormiApi.admin.createPlan({
        code: create.code.trim().toUpperCase(),
        name: create.name.trim(),
        description: create.description.trim() || undefined,
        priceMonthly: create.priceMonthly.trim() === '' ? null : create.priceMonthly.trim(),
      });
      const created = (res as { data?: AdminPlan }).data ?? (res as AdminPlan);
      if (created.planId) {
        await dormiApi.admin.setPlanFeatures(created.planId, [...create.features]);
        await dormiApi.admin.setPlanLimits(created.planId, [
          {
            key: 'room_limit',
            value: create.roomLimit.trim() === '' ? null : Number(create.roomLimit),
          },
        ]);
      }
      setCreateOpen(false);
      setCreate(EMPTY_CREATE);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างแผนไม่สำเร็จ');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setError(null);
    try {
      await dormiApi.admin.deletePlan(deleting.planId);
      setDeleting(null);
      void load();
    } catch (err) {
      // backend บล็อกลบแผน default / แผนที่มีลูกค้าใช้อยู่ — โชว์เหตุผลตรงๆ
      setError(err instanceof Error ? err.message : 'ลบแผนไม่สำเร็จ');
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">แผน & ราคา</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            + สร้างแผน
          </Button>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!plans ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.planId} className="card">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-ink">
                      {plan.code}
                      {plan.isDefault && <Badge variant="secondary">default</Badge>}
                      {!plan.isActive && <Badge variant="danger">ปิดใช้งาน</Badge>}
                    </CardTitle>
                    <p className="mt-1 text-sm text-ink-muted">{plan.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                      แก้ไข
                    </Button>
                    {!plan.isDefault && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleting(plan)}
                      >
                        ลบ
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="font-display text-2xl font-bold text-ink">
                    {plan.priceMonthly ? `฿${plan.priceMonthly}/เดือน` : 'ฟรี'}
                  </div>
                  <div>
                    <span className="text-ink-muted">เพดานห้องรวม: </span>
                    <span className="font-medium text-ink">
                      {plan.limits?.['room_limit'] ?? 'ไม่จำกัด'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(plan.features ?? []).map((f) => (
                      <Badge key={f} variant="outline">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted">
                    ลูกค้าที่ใช้แผนนี้ (assign แล้ว): {plan.subscribers ?? 0} ราย
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างแผนใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>code (A-Z, 0-9, _ เท่านั้น)</Label>
                <Input
                  value={create.code}
                  onChange={(e) => setCreate({ ...create, code: e.target.value })}
                  placeholder="เช่น PLUS"
                />
              </div>
              <div className="space-y-2">
                <Label>ชื่อแผน</Label>
                <Input
                  value={create.name}
                  onChange={(e) => setCreate({ ...create, name: e.target.value })}
                  placeholder="เช่น พลัส"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย (โชว์หน้า pricing)</Label>
              <Input
                value={create.description}
                onChange={(e) => setCreate({ ...create, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ราคา/เดือน (บาท) — ว่าง = ฟรี</Label>
                <Input
                  inputMode="decimal"
                  value={create.priceMonthly}
                  onChange={(e) => setCreate({ ...create, priceMonthly: e.target.value })}
                  placeholder="เช่น 490.00"
                />
              </div>
              <div className="space-y-2">
                <Label>เพดานห้องรวม — ว่าง = ไม่จำกัด</Label>
                <Input
                  inputMode="numeric"
                  value={create.roomLimit}
                  onChange={(e) => setCreate({ ...create, roomLimit: e.target.value })}
                  placeholder="เช่น 100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ฟีเจอร์ที่เปิดให้แผนนี้</Label>
              <div className="space-y-1.5">
                {KNOWN_FEATURES.map((f) => (
                  <label key={f.code} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={create.features.has(f.code)}
                      onChange={(e) => {
                        const next = new Set(create.features);
                        if (e.target.checked) next.add(f.code);
                        else next.delete(f.code);
                        setCreate({ ...create, features: next });
                      }}
                      className="h-4 w-4 accent-[#059669]"
                    />
                    <span>
                      {f.label}{' '}
                      <code className="text-xs text-ink-muted">({f.code})</code>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={() => void submitCreate()}
              disabled={creating || !create.code || !create.name}
            >
              {creating ? 'กำลังสร้าง…' : 'สร้างแผน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบแผน {deleting?.code}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            แผนจะหายจากหน้า pricing และ assign ให้ลูกค้าใหม่ไม่ได้อีก
            (ประวัติ subscription เดิมยังอยู่) — ระบบจะไม่ยอมลบถ้ายังมีลูกค้าใช้แผนนี้อยู่
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleteBusy}
            >
              {deleteBusy ? 'กำลังลบ…' : 'ยืนยันลบแผน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={edit !== null} onOpenChange={(open) => !open && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขแผน {edit?.plan.code}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ชื่อแผน</Label>
                <Input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ราคา/เดือน (บาท) — ว่าง = ฟรี</Label>
                  <Input
                    inputMode="decimal"
                    value={edit.priceMonthly}
                    onChange={(e) => setEdit({ ...edit, priceMonthly: e.target.value })}
                    placeholder="เช่น 990.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>เพดานห้องรวม — ว่าง = ไม่จำกัด</Label>
                  <Input
                    inputMode="numeric"
                    value={edit.roomLimit}
                    onChange={(e) => setEdit({ ...edit, roomLimit: e.target.value })}
                    placeholder="เช่น 30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ฟีเจอร์ที่เปิดให้แผนนี้</Label>
                <div className="space-y-1.5">
                  {KNOWN_FEATURES.map((f) => (
                    <label key={f.code} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={edit.features.has(f.code)}
                        onChange={(e) => {
                          const next = new Set(edit.features);
                          if (e.target.checked) next.add(f.code);
                          else next.delete(f.code);
                          setEdit({ ...edit, features: next });
                        }}
                        className="h-4 w-4 accent-[#059669]"
                      />
                      <span>
                        {f.label}{' '}
                        <code className="text-xs text-ink-muted">({f.code})</code>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              ยกเลิก
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
