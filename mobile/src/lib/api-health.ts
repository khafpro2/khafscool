import { useEffect, useSyncExternalStore } from 'react';
import { API_URL } from '../config';
import {
  isApiUnavailable,
  recordApiSuccess,
  setApiUnavailable,
  subscribeApiStatus,
} from './api-status-store';

const HEALTH_POLL_MS = 45_000;
const HEALTH_TIMEOUT_MS = 5_000;

export async function checkApiHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
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
    const timer = setInterval(poll, HEALTH_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
}
