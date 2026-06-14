import type { LucideIcon } from 'lucide-react';
import { BarChart3, ClipboardList, Coins, Wrench } from 'lucide-react';

import { TrackSection } from '@/components/TrackSection';

const features: {
  Icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
}[] = [
  {
    Icon: BarChart3,
    title: 'บริหารจัดการภาพรวมได้ในที่เดียว',
    desc: 'พลิกโฉมการดูแลหอพักด้วย Dashboard อัจฉริยะ ติดตามสถานะห้องว่าง รายได้ และงานค้างทั้งหมดได้แบบเรียลไทม์ผ่านปลายนิ้ว ไม่ว่าจะอยู่ที่ไหนก็จัดการได้ทันที',
    tag: 'Real-time Dashboard',
  },
  {
    Icon: Coins,
    title: 'จัดการค่าเช่าอัตโนมัติ ครบจบ',
    desc: 'ระบบจัดการบิลและมิเตอร์ที่แม่นยำ ช่วยให้การชำระเงินออนไลน์เป็นเรื่องง่ายสำหรับผู้เช่า และเป็นเรื่องสบายสำหรับคุณ',
    tag: 'Auto Billing',
  },
  {
    Icon: ClipboardList,
    title: 'จัดการข้อมูลผู้เช่าและสัญญาดิจิทัล',
    desc: 'บริหารเอกสารผู้เช่าแบบออนไลน์ 100% พร้อมระบบผู้ช่วยเตือนวันสิ้นสุดสัญญาและต่อสัญญาให้อัตโนมัติ',
    tag: 'Digital Contract',
  },
  {
    Icon: Wrench,
    title: 'แจ้งซ่อมง่าย แก้ไขไว ติดตามได้ทันที',
    desc: 'เชื่อมต่อผู้เช่าและทีมช่างเข้าด้วยกันผ่านระบบแจ้งซ่อมออนไลน์ ให้คุณไม่พลาดทุกการแจ้งเตือน พร้อมควบคุมระยะเวลาการทำงาน',
    tag: 'Maintenance Tracker',
  },
];

export function Features() {
  return (
    <TrackSection id="features" label="ฟีเจอร์" className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          {/* <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal">ฟีเจอร์</div> */}
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            ครบจบในที่เดียว
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-muted">
            ระบบที่จะช่วยให้ ทำงานน้อยลง เป็นระบบมากขึ้น สะดวกสบายมากยิ่งขึ้น
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const { Icon } = f;
            return (
              <div
                key={f.title}
                className="group flex h-full flex-col rounded-2xl border border-teal/15 bg-white/80 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-card"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-teal/20 bg-teal/10 text-teal">
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </TrackSection>
  );
}
