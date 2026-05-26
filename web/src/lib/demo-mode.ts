'use client';

import { useSyncExternalStore } from 'react';
import { isDemoModeActive, subscribeDemoMode } from './demo-mode-store';

export { clearDemoMode, markDemoFallback } from './demo-mode-store';

export function useDemoMode() {
  return useSyncExternalStore(subscribeDemoMode, isDemoModeActive, () => false);
}
