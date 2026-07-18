'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import {
  dormiApi,
  DormiApiError,
  type AdminPermission,
  type AdminRole,
} from '@/lib/dormi-api';
import { getToken } from '@/lib/session';

/** จัดการ role/permission ระดับระบบ — role ระบบดูได้อย่างเดียว, role ที่ทีมสร้างแก้สิทธิ์ได้ */
export default function AdminRolesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // role ที่กำลังแก้สิทธิ์
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // dialog สร้าง role
  const [createOpen, setCreateOpen] = useState(false);
  const [newRole, setNewRole] = useState({ code: '', name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roleList, permList] = await Promise.all([
        dormiApi.admin.rbacRoles(),
        dormiApi.admin.rbacPermissions(),
      ]);
      setRoles(roleList);
      setPermissions(permList);
    } catch (err) {
      if (err instanceof DormiApiError && err.status === 401) {
        router.replace('/admin/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  /** จัดกลุ่ม permission ตาม module (prefix ก่อนจุดแรกของ code) */
  const grouped = useMemo(() => {
    const groups = new Map<string, AdminPermission[]>();
    for (const p of permissions) {
      const module = p.code.split('.')[0] ?? 'อื่นๆ';
      const list = groups.get(module) ?? [];
      list.push(p);
      groups.set(module, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const openEdit = (role: AdminRole) => {
    setEditing(role);
    setSelected(new Set(role.permissionCodes));
  };

  const togglePermission = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const savePermissions = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await dormiApi.admin.setRolePermissions(editing.roleId, [...selected]);
      setEditing(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกสิทธิ์ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    if (!newRole.code || !newRole.name) return;
    setCreating(true);
    try {
      await dormiApi.admin.createRole({
        code: newRole.code,
        name: newRole.name,
        description: newRole.description || undefined,
      });
      setCreateOpen(false);
      setNewRole({ code: '', name: '', description: '' });
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้าง role ไม่สำเร็จ');
    } finally {
      setCreating(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-ink">Role & สิทธิ์</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            + สร้าง role
          </Button>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {roles.map((role) => (
              <div key={role.roleId} className="card flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{role.name}</span>
                    <code className="rounded bg-secondary/10 px-1.5 py-0.5 text-xs text-secondary">
                      {role.code}
                    </code>
                    {role.isSuperuser && (
                      <Badge variant="default">
                        <ShieldCheck className="mr-1 h-3 w-3" /> superuser
                      </Badge>
                    )}
                    {role.isSystem && !role.isSuperuser && (
                      <Badge variant="secondary">
                        <Lock className="mr-1 h-3 w-3" /> ระบบ
                      </Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="mt-1 text-sm text-ink-muted">{role.description}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-muted">
                    {role.isSuperuser
                      ? 'มีทุกสิทธิ์โดยอัตโนมัติ'
                      : `${role.permissionCodes.length} สิทธิ์`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={role.isSystem || role.isSuperuser}
                  onClick={() => openEdit(role)}
                >
                  {role.isSystem || role.isSuperuser ? 'ดูอย่างเดียว' : 'แก้สิทธิ์'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              แก้สิทธิ์ — {editing?.name} ({selected.size} สิทธิ์)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {grouped.map(([module, perms]) => (
              <div key={module}>
                <div className="mb-1.5 text-xs font-medium uppercase text-ink-muted">
                  {module}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {perms.map((p) => (
                    <label
                      key={p.code}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-secondary/15 px-2.5 py-1.5 text-sm hover:bg-secondary/5"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(p.code)}
                        onChange={() => togglePermission(p.code)}
                        className="accent-current"
                      />
                      <span className="truncate" title={p.description ?? p.code}>
                        {p.code}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              ยกเลิก
            </Button>
            <Button onClick={() => void savePermissions()} disabled={saving}>
              {saving ? 'กำลังบันทึก…' : 'บันทึกสิทธิ์'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้าง role ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>code (a-z, ตัวเลข, ขีดกลาง)</Label>
              <Input
                value={newRole.code}
                onChange={(e) => setNewRole((r) => ({ ...r, code: e.target.value }))}
                placeholder="เช่น accountant"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อแสดงผล</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole((r) => ({ ...r, name: e.target.value }))}
                placeholder="เช่น ฝ่ายบัญชี"
              />
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Input
                value={newRole.description}
                onChange={(e) => setNewRole((r) => ({ ...r, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={() => void createRole()}
              disabled={creating || !newRole.code || !newRole.name}
            >
              {creating ? 'กำลังสร้าง…' : 'สร้าง role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
