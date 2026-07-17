'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TrackSection } from '@/components/TrackSection';
import { TrackedButton } from '@/components/TrackedButton';
import { dormiApi, type PublicPlan } from '@/lib/dormi-api';

interface Props {
  onRegisterClick: () => void;
}

/** copy การตลาดต่อแผน (ราคา/เพดานห้องมาจาก API — source of truth เดียวกับที่ระบบบังคับจริง) */
const PLAN_COPY: Record<
  string,
  { name: string; desc: string; cta: string; trackId: string; featured?: boolean }
> = {
  FREE: {
    name: 'สำหรับผู้เริ่มต้น',
    desc: 'สำหรับหอพักขนาดเล็กที่ต้องการเริ่มต้น',
    cta: 'เริ่มต้นฟรี',
    trackId: 'pricing_starter',
  },
  PRO: {
    name: 'สำหรับมืออาชีพ',
    desc: 'สำหรับเจ้าของหอพักที่ต้องการระบบครบ',
    cta: 'เลือกแผนนี้',
    trackId: 'pricing_pro',
    featured: true,
  },
};

const FEATURE_LABELS: Record<string, string> = {
  core: 'จัดการหอ / ห้อง / ผู้เช่า / มิเตอร์',
  billing: 'ระบบบิลอัตโนมัติ + รอบบิล',
  finance: 'โมดูลการเงิน รายรับ-รายจ่าย',
  staff_roles: 'ตำแหน่งพนักงาน + กำหนดสิทธิ์',
};

function planFeatureList(plan: PublicPlan): string[] {
  const roomLimit = plan.limits['room_limit'];
  const items = [
    roomLimit === null || roomLimit === undefined
      ? 'ห้องพักไม่จำกัด'
      : `ห้องพักสูงสุด ${roomLimit} ห้อง (รวมทุกหอ)`,
    'สร้างหอได้ไม่จำกัด',
  ];
  for (const code of plan.features) {
    const label = FEATURE_LABELS[code];
    if (label) items.push(label);
  }
  return items;
}

function formatPrice(plan: PublicPlan): { price: string; unit?: string } {
  if (!plan.priceMonthly) return { price: 'ฟรี' };
  const amount = Number(plan.priceMonthly);
  return {
    price: `฿${Number.isFinite(amount) ? amount.toLocaleString('th-TH') : plan.priceMonthly}`,
    unit: '/ เดือน',
  };
}

export function Pricing({ onRegisterClick }: Props) {
  // ดึงแผนจริงจาก dormi API — ดึงไม่ได้ = โชว์ค่า fallback เดิม (marketing ไม่ล่มตาม backend)
  const [plans, setPlans] = useState<PublicPlan[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    dormiApi
      .publicPlans()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        /* ใช้ fallback static */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TrackSection id="pricing" label="ราคา" className="section-pad">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          {/* <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal">ราคา</div> */}
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            แผนที่เหมาะกับคุณ
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-muted">
            ทดลองใช้ฟรี 3 เดือน ไม่ต้องใช้บัตรเครดิต
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans ? (
            plans.map((plan) => {
              const copy = PLAN_COPY[plan.code] ?? {
                name: plan.name,
                desc: plan.description ?? '',
                cta: 'เลือกแผนนี้',
                trackId: `pricing_${plan.code.toLowerCase()}`,
              };
              const { price, unit } = formatPrice(plan);
              return (
                <PlanCard
                  key={plan.code}
                  name={copy.name}
                  price={price}
                  unit={unit}
                  desc={copy.desc}
                  featured={copy.featured}
                  features={planFeatureList(plan)}
                  cta={copy.cta}
                  trackId={copy.trackId}
                  onClick={onRegisterClick}
                />
              );
            })
          ) : (
            <>
              <PlanCard
                name="สำหรับผู้เริ่มต้น"
                price="ฟรี"
                desc="สำหรับหอพักขนาดเล็กที่ต้องการเริ่มต้น"
                features={[
                  'ห้องพักสูงสุด 30 ห้อง (รวมทุกหอ)',
                  'สร้างหอได้ไม่จำกัด',
                  'Dashboard พื้นฐาน',
                ]}
                cta="เริ่มต้นฟรี"
                trackId="pricing_starter"
                onClick={onRegisterClick}
              />
              <PlanCard
                name="สำหรับมืออาชีพ"
                price="฿990"
                unit="/ เดือน"
                desc="สำหรับเจ้าของหอพักที่ต้องการระบบครบ"
                featured
                features={[
                  'ห้องพักไม่จำกัด',
                  'ระบบบิลอัตโนมัติ + รอบบิล',
                  'โมดูลการเงิน รายรับ-รายจ่าย',
                  'ตำแหน่งพนักงาน + กำหนดสิทธิ์',
                ]}
                cta="เลือกแผนนี้"
                trackId="pricing_pro"
                onClick={onRegisterClick}
              />
            </>
          )}

          <PlanCard
            name="สำหรับองค์กร"
            price="Custom"
            desc="สำหรับบริษัทบริหารอสังหาฯ ขนาดใหญ่"
            features={[
              'ห้องพักไม่จำกัด',
              'API Integration',
              'ทีม Support เฉพาะ',
              'Training และ Onboarding',
              'Custom Report',
            ]}
            cta="ติดต่อทีมงาน"
            trackId="pricing_enterprise"
            onClick={onRegisterClick}
          />
        </div>
      </div>
    </TrackSection>
  );
}

interface PlanProps {
  name: string;
  price: string;
  unit?: string;
  desc: string;
  features: string[];
  cta: string;
  trackId: string;
  onClick: () => void;
  featured?: boolean;
}

function PlanCard({ name, price, unit, desc, features, cta, trackId, onClick, featured }: PlanProps) {
  return (
    <div
      className={`relative rounded-2xl border p-7 transition hover:-translate-y-1 ${
        featured
          ? 'border-teal bg-teal/[0.04] shadow-[0_8px_30px_-10px_rgba(21,128,61,0.2)]'
          : 'border-teal/15 bg-white shadow-xs'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal px-3 py-1 text-xs font-bold text-white shadow-xs">
          ยอดนิยม
        </div>
      )}
      <div className="text-sm text-ink-muted">{name}</div>
      <div className="mt-1 font-display text-4xl font-bold text-ink">
        {price} {unit && <span className="text-base font-normal text-ink-muted">{unit}</span>}
      </div>
      <p className="mt-2 border-b border-teal/10 pb-5 text-sm text-ink-muted">{desc}</p>
      <ul className="my-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-ink-muted">
            <span className="mt-0.5 shrink-0 text-teal">
              <Check className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <TrackedButton
        trackId={trackId}
        trackLabel={`${name} — ${cta}`}
        onClick={onClick}
        className={
          featured
            ? 'btn-primary w-full'
            : 'w-full rounded-lg border border-teal/15 bg-teal/[0.06] py-2.5 text-sm font-semibold text-ink transition hover:bg-teal/12'
        }
      >
        {cta}
      </TrackedButton>
    </div>
  );
}
