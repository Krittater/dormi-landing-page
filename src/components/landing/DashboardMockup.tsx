import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, Check, Clock } from 'lucide-react';

import { TrackSection } from '@/components/TrackSection';

export function DashboardMockup() {
  return (
    <TrackSection
      id="mockup"
      label="Dashboard Mockup"
      as="div"
      className="px-6 pb-20 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-teal/20 bg-white shadow-mockup animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-teal/10 bg-navy-2 px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <div className="mx-2 flex-1 truncate rounded-md border border-teal/10 bg-navy px-3 py-1 text-center text-xs text-ink-muted">
            app.dormilink.co.th/dashboard
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-ink sm:text-lg">
              <BarChart3 className="size-5 shrink-0 text-teal" strokeWidth={1.75} aria-hidden />
              รายงานภาพรวม — ธันวาคม 2567
            </div>
            <div className="rounded-md border border-teal/30 bg-teal/15 px-3 py-1 text-xs text-teal-dark">
              อัพเดทแบบ Real-time
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'ห้องทั้งหมด', value: '50', tone: 'ink' },
              { label: 'ผู้เช่าปัจจุบัน', value: '45', tone: 'ink' },
              { label: 'แจ้งซ่อมรอดำเนินการ', value: '3', tone: 'ink' },
              { label: 'รายได้เดือนนี้', value: '฿72,800', tone: 'teal' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-teal/10 bg-navy-4 p-4">
                <div className="mb-1 text-[11px] text-ink-muted">{c.label}</div>
                <div
                  className={`font-display text-xl font-bold sm:text-2xl ${
                    c.tone === 'teal' ? 'text-teal' : 'text-ink'
                  }`}
                >
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="flex h-32 items-end gap-2 rounded-xl border border-teal/10 bg-navy-4 p-4">
              {[
                [55, 40],
                [70, 55],
                [45, 35],
                [90, 75],
                [80, 65],
              ].map(([a, b], i) => (
                <div key={i} className="flex flex-1 items-end gap-1">
                  <div
                    style={{ height: `${a}%`, background: 'rgba(5,150,105,0.55)' }}
                    className="flex-1 rounded-t"
                  />
                  <div
                    style={{ height: `${b}%`, background: 'rgba(5,150,105,0.28)' }}
                    className="flex-1 rounded-t"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-teal/10 bg-navy-4 p-4">
              <div className="mb-2 text-xs text-ink-muted">รายการล่าสุด</div>
              <ul className="space-y-1.5 text-sm">
                <Row
                  label="ห้อง A101 — ชำระค่าเช่า"
                  tone="green"
                  badge={
                    <>
                      <Check className="size-3 shrink-0" strokeWidth={2.25} aria-hidden />
                      <span>สำเร็จ</span>
                    </>
                  }
                />
                <Row
                  label="ห้อง B203 — แจ้งซ่อมน้ำรั่ว"
                  tone="yellow"
                  badge={
                    <>
                      <Clock className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                      <span>รอดำเนินการ</span>
                    </>
                  }
                />
                <Row
                  label="ห้อง C304 — สัญญาใกล้หมด"
                  tone="red"
                  badge={
                    <>
                      <AlertTriangle className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                      <span>แจ้งเตือน</span>
                    </>
                  }
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TrackSection>
  );
}

function Row({
  label,
  badge,
  tone,
}: {
  label: string;
  badge: ReactNode;
  tone: 'green' | 'yellow' | 'red';
}) {
  const cls =
    tone === 'green'
      ? 'bg-teal/12 text-teal-dark'
      : tone === 'yellow'
        ? 'bg-amber-100/90 text-amber-800'
        : 'bg-red-100/90 text-red-800';
  return (
    <li className="flex items-center justify-between border-b border-teal/10 pb-1.5 last:border-0">
      <span className="truncate pr-2 text-ink-muted">{label}</span>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${cls}`}
      >
        {badge}
      </span>
    </li>
  );
}
