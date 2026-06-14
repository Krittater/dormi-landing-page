'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  id: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
  as?: 'section' | 'div';
}

export function TrackSection({ id, label, className, children, as = 'section' }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4 && !fired.current) {
            fired.current = true;
            void trackEvent({ type: 'SECTION_VIEW', target: id, label });
            obs.disconnect();
          }
        }
      },
      { threshold: [0, 0.4, 0.8] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id, label]);

  if (as === 'div') {
    return (
      <div
        id={id}
        ref={(el) => {
          ref.current = el;
        }}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <section
      id={id}
      ref={(el) => {
        ref.current = el;
      }}
      className={className}
    >
      {children}
    </section>
  );
}
