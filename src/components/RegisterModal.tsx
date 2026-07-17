'use client';

import { CircleCheck, SendHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

interface Props {
  open: boolean;
  onClose: () => void;
  source?: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const initial: FormState = { firstName: '', lastName: '', email: '', phone: '' };

export function RegisterModal({ open, onClose, source }: Props) {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initial);
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError('กรุณากรอก ชื่อ นามสกุล และเบอร์โทร');
      return;
    }
    const phoneOk = /^[0-9+\-\s()]{8,20}$/.test(form.phone.trim());
    if (!phoneOk) {
      setError('รูปแบบเบอร์โทรไม่ถูกต้อง');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/registrations', {
        method: 'POST',
        json: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
        },
      });
      void trackEvent({
        type: 'BUTTON_CLICK',
        target: 'register_submit_success',
        label: 'ลงทะเบียนสำเร็จ',
        metadata: { source },
      });
      setSuccess('ขอบคุณครับ! เราได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-secondary/20 bg-white p-6 shadow-mockup sm:p-8 animate-fade-in-up">
        <button
          aria-label="ปิด"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-ink-muted transition hover:bg-secondary/10 hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-5">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs text-secondary">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-secondary" />
            ฟรี 3 เดือนแรก
          </div>
          <h3 id="register-title" className="font-display text-2xl font-bold text-ink">
            ลงทะเบียนรับสิทธิ์ทดลองใช้
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            ทีมงานจะติดต่อกลับภายใน 1 วันทำการ
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-secondary/25 bg-secondary/10 p-4 text-sm text-secondary-dark">
              <CircleCheck className="mt-0.5 size-5 shrink-0 stroke-[2.25]" aria-hidden />
              <span>{success}</span>
            </div>
            <button onClick={onClose} className="btn-primary w-full">
              ปิดหน้าต่าง
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="ชื่อ *"
                value={form.firstName}
                onChange={(v) => setForm((s) => ({ ...s, firstName: v }))}
                placeholder="สมชาย"
                autoFocus
              />
              <Field
                label="นามสกุล *"
                value={form.lastName}
                onChange={(v) => setForm((s) => ({ ...s, lastName: v }))}
                placeholder="ใจดี"
              />
            </div>
            <Field
              label="อีเมล (ไม่บังคับ)"
              type="email"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
              placeholder="you@example.com"
            />
            <Field
              label="เบอร์โทร *"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
              placeholder="08x-xxx-xxxx"
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                'กำลังส่งข้อมูล...'
              ) : (
                <>
                  <SendHorizontal className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  ส่งข้อมูล
                </>
              )}
            </button>
            <p className="text-center text-xs text-ink-muted">
              เราเก็บข้อมูลตามนโยบายความเป็นส่วนตัวเท่านั้น
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-secondary/20 bg-secondary-muted px-3 py-2.5 text-sm text-ink outline-hidden transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </label>
  );
}
