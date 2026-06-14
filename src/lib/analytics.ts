'use client';

import { apiFetch } from './api';
import { getOrCreateSessionId } from './session';

export type EventType = 'SECTION_VIEW' | 'BUTTON_CLICK';

export interface TrackPayload {
  type: EventType;
  target: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(payload: TrackPayload): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await apiFetch('/analytics/track', {
      method: 'POST',
      json: { ...payload, sessionId: getOrCreateSessionId() },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[trackEvent] failed', err);
    }
  }
}
