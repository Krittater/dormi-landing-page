'use client';

import { useState } from 'react';

import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { Features } from '@/components/landing/Features';
import { Steps } from '@/components/landing/Steps';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { RegisterModal } from '@/components/RegisterModal';

export default function HomePage() {
  const [openRegister, setOpenRegister] = useState(false);
  // แผนที่ลูกค้ากดเลือกจากการ์ดราคา — ติดไปกับ lead ตอนลงทะเบียน
  const [interestedPlan, setInterestedPlan] = useState<string | undefined>(undefined);

  const open = (planCode?: string) => {
    setInterestedPlan(planCode);
    setOpenRegister(true);
  };
  const close = () => setOpenRegister(false);

  return (
    <main>
      <Nav onRegisterClick={() => open()} />
      <Hero onRegisterClick={() => open()} />
      <DashboardMockup />
      <Features />
      <Steps />
      <Pricing onRegisterClick={open} />
      <Testimonials />
      <CTA onRegisterClick={() => open()} />
      <Footer />
      <RegisterModal
        open={openRegister}
        onClose={close}
        source="landing"
        interestedPlan={interestedPlan}
      />
    </main>
  );
}
