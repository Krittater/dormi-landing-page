'use client';

import { forwardRef } from 'react';
import { trackEvent } from '@/lib/analytics';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  trackId: string;
  trackLabel?: string;
};

export const TrackedButton = forwardRef<HTMLButtonElement, Props>(function TrackedButton(
  { trackId, trackLabel, onClick, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      onClick={(e) => {
        void trackEvent({ type: 'BUTTON_CLICK', target: trackId, label: trackLabel });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
