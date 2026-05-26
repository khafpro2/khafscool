'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { resolveClientApiPath } from './api-url';
import {
  isApiUnavailable,
  recordApiSuccess,
  setApiUnavailable,
  subscribeApiStatus,
} from './api-status-store';

const HEALTH_POLL_MS = 45_000;

function healthCheckUrl(): string {
  return resolveClientApiPath('/health');
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(healthCheckUrl(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

export function useApiUnavailable() {
  return useSyncExternalStore(subscribeApiStatus, isApiUnavailable, () => false);
}

export function useApiHealthPolling() {
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const healthy = await checkApiHealth();
      if (cancelled) return;
      if (healthy) {
        recordApiSuccess();
        setApiUnavailable(false);
      } else {
        setApiUnavailable(true);
      }
    }

    void poll();
    const timer = window.setInterval(poll, HEALTH_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);
}
