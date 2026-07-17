import { Star } from 'lucide-react';

import { TrackSection } from '@/components/TrackSection';

const reviews = [
  {
    text: '“ก่อนใช้ dormi ต้องนั่งคีย์ข้อมูลทุกเดือน ตอนนี้ระบบทำให้หมด เหลือแค่กดยืนยัน ประหยัดเวลาได้มาก”',
    initial: 'สก',
    name: 'สกาวเดือน ท.',
    role: 'เจ้าของหอพัก เชียงใหม่',
  },
  {
    text: '“ระบบแจ้งซ่อมดีมาก ผู้เช่าแจ้งปุ๊บ เราเห็นทันที ช่างเข้าไปแก้ได้เลย ไม่มีตกหล่นอีกแล้ว”',
    initial: 'วร',
    name: 'วรวุฒิ พ.',
    role: 'ผู้จัดการอพาร์ตเมนต์ กรุงเทพ',
  },
  {
    text: '“เก็บค่าเช่าง่ายขึ้นมาก ผู้เช่าโอนแล้วระบบอัพเดทเอง ไม่ต้องไปไล่ถามทุกห้องเหมือนเดิม”',
    initial: 'นร',
    name: 'นรินทร์ ล.',
    role: 'เจ้าของหอพัก เชียงราย',
  },
];

export function Testimonials() {
  return (
    <TrackSection id="testimonials" label="รีวิว" className="bg-navy-2 section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          {/* <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal">รีวิว</div> */}
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            เสียงจากผู้ใช้จริง
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-teal/15 bg-white/90 p-6 shadow-xs"
            >
              <div className="mb-3 flex gap-0.5 text-teal" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-teal text-teal" strokeWidth={0} />
                ))}
              </div>
              <p className="mb-5 text-sm italic leading-relaxed text-ink-muted">{r.text}</p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-teal/15 text-sm font-bold text-teal">
                  {r.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-ink-muted">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TrackSection>
  );
}
