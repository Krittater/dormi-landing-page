'use client';

import { Rocket } from 'lucide-react';

import { TrackSection } from '@/components/TrackSection';
import { TrackedButton } from '@/components/TrackedButton';

interface Props {
  onRegisterClick: () => void;
}

export function Hero({ onRegisterClick }: Props) {
  return (
    <TrackSection
      id="hero"
      label="Hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-navy-2 px-6 pb-16 pt-28 text-center md:px-12 md:pt-32 lg:px-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_85%_55%_at_50%_28%,rgba(16,185,129,0.14)_0%,rgba(5,150,105,0.06)_35%,transparent_68%)]"
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">

      <h1 className="font-display text-4xl font-bold text-ink animate-fade-in-down sm:text-5xl md:text-6xl tracking-wide" style={{ lineHeight: '1.25' }}>
  บริหารหอพักให้เป็น
  <br />
  เรื่องง่าย{' '}
  <span className="font-extrabold text-accent">ลดเวลา ลดขั้นตอน</span>
  <br />
  จัดการจบในที่เดียว
</h1>

        <p className="mt-6 max-w-xl text-base text-ink-muted animate-fade-in-down md:text-lg">
          ยกระดับการจัดการด้วย Dormi ระบบที่ออกแบบมาเพื่อลดภาระเจ้าของและผู้ดูแลโดยเฉพาะ
          ตั้งแต่การทำสัญญา จัดการบิล ไปจนถึงงานซ่อมบำรุง
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in-down">
          <TrackedButton
            trackId="hero_cta_start_free"
            trackLabel="เริ่มต้นใช้งานฟรี 3 เดือน"
            onClick={onRegisterClick}
            className="btn-primary px-8 py-3.5 text-base"
          >
            <Rocket className="size-[1.125rem]" strokeWidth={2} aria-hidden />
            เริ่มต้นใช้งานฟรี 3 เดือน
          </TrackedButton>
          <TrackedButton
            trackId="hero_cta_book_demo"
            trackLabel="จองการทดลองใช้งาน"
            onClick={onRegisterClick}
            className="btn-outline px-8 py-3.5 text-base"
          >
            จองการทดลองใช้งาน
          </TrackedButton>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-8 animate-fade-in sm:grid-cols-3 sm:gap-10">
          {[
            { num: '500+', label: 'ห้องพักในระบบ' },
            { num: '120+', label: 'เจ้าของหอพัก' },
            { num: '98%', label: 'ความพึงพอใจ' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold text-teal sm:text-3xl md:text-[2rem]">{s.num}</div>
              <div className="mt-1 text-xs leading-snug text-ink-muted sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </TrackSection>
  );
}
