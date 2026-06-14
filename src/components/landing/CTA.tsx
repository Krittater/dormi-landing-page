'use client';

import { Phone, Rocket } from 'lucide-react';

import { TrackSection } from '@/components/TrackSection';
import { TrackedButton } from '@/components/TrackedButton';

interface Props {
  onRegisterClick: () => void;
}

export function CTA({ onRegisterClick }: Props) {
  return (
    <TrackSection
      id="contact"
      label="CTA / ติดต่อ"
      className="border-y border-teal/15 [background:linear-gradient(135deg,rgba(21,128,61,0.08)_0%,rgba(240,253,244,0.85)_48%,rgba(21,128,61,0.05)_100%)] section-pad text-center"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
          พร้อมหรือยัง?
          <br />
          <h4 className="text-lg lg:text-3xl">ที่จะเปลี่ยนงานบริหารที่วุ่นวาย ให้เป็นเรื่องง่าย</h4>
        </h2>
        <p className="mt-4 text-base text-ink-muted">
          ก้าวสู่การบริหารที่ง่ายขึ้น ร่วมกับเจ้าของหอพักชั้นนำที่เลือกใช้ Dormi
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <TrackedButton
            trackId="cta_start_free"
            trackLabel="เริ่มต้นใช้งานฟรี! (CTA)"
            onClick={onRegisterClick}
            className="btn-primary px-8 py-3.5 text-base"
          >
            <Rocket className="size-[1.125rem]" strokeWidth={2} aria-hidden />
            เริ่มต้นใช้งานฟรี!
          </TrackedButton>
          <TrackedButton
            trackId="cta_contact"
            trackLabel="ติดต่อทีมงาน (CTA)"
            onClick={onRegisterClick}
            className="btn-outline px-8 py-3.5 text-base"
          >
            <Phone className="size-[1.125rem]" strokeWidth={2} aria-hidden />
            ติดต่อทีมงาน
          </TrackedButton>
        </div>
        <div className="mt-5 text-xs text-ink-muted">
          ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ · ฟรี 3 เดือนแรก
        </div>
      </div>
    </TrackSection>
  );
}
