'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { clearToken } from '@/lib/session';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin/dashboard', label: 'ภาพรวม & Lead' },
  { href: '/admin/customers', label: 'ลูกค้า' },
  { href: '/admin/plans', label: 'แผน & ราคา' },
  { href: '/admin/roles', label: 'Role & สิทธิ์' },
  { href: '/admin/audit', label: 'Audit' },
];

/** แถบนำทางแผงควบคุมทีมงาน — dashboard/lead อยู่ dormi-admin · ลูกค้า/แผนอยู่ dormi-backend-2 (SSO token เดียวกัน) */
export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-secondary/15 bg-white/90 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-bold text-ink">
            dormi <span className="text-secondary">admin</span>
          </span>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            clearToken();
            router.replace('/admin/login');
          }}
        >
          ออกจากระบบ
        </Button>
      </div>
    </header>
  );
}
