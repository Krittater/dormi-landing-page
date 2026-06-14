'use client';

import { useState } from 'react';
import { TrackedButton } from '@/components/TrackedButton';

interface Props {
  onRegisterClick: () => void;
}

export function Nav({ onRegisterClick }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-secondary/10 bg-navy-2/90 px-6 py-3.5 backdrop-blur-xl md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="font-display text-lg font-bold tracking-tight text-ink md:text-xl">
          <span className="font-extrabold">Dormi</span>{' '}
        </div>

        <ul className="hidden items-center gap-7 lg:flex">
          {[
            { href: '#features', label: 'ฟีเจอร์' },
            { href: '#how', label: 'วิธีใช้งาน' },
            { href: '#pricing', label: 'ราคา' },
            { href: '#contact', label: 'ติดต่อ' },
          ].map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-ink/90 transition-colors hover:text-secondary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {/* <Link href="/admin/login" className="btn-ghost">
            ล็อคอิน
          </Link> */}
          <TrackedButton
            trackId="nav_cta_try"
            trackLabel="ลองเลย! (Nav)"
            onClick={onRegisterClick}
            className="btn-primary"
          >
            ลองเลย!
          </TrackedButton>
        </div>

        <button
          aria-label="เมนู"
          className="rounded-lg p-2 text-ink-muted hover:bg-teal/10 md:hidden"
          onClick={() => setOpen((s) => !s)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-3 max-w-7xl rounded-2xl border border-teal/12 bg-white p-4 shadow-sm md:hidden">
          <ul className="space-y-2">
            {[
              { href: '#features', label: 'ฟีเจอร์' },
              { href: '#how', label: 'วิธีใช้งาน' },
              { href: '#pricing', label: 'ราคา' },
              { href: '#contact', label: 'ติดต่อ' },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-ink/90 hover:bg-secondary/10 hover:text-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            {/* <Link
              href="/admin/login"
              className="btn-outline flex-1"
              onClick={() => setOpen(false)}
            >
              ล็อคอิน
            </Link> */}
            <TrackedButton
              trackId="nav_cta_try_mobile"
              trackLabel="ลองเลย! (Mobile Nav)"
              onClick={() => {
                setOpen(false);
                onRegisterClick();
              }}
              className="btn-primary flex-1"
            >
              ลองเลย!
            </TrackedButton>
          </div>
        </div>
      )}
    </nav>
  );
}
