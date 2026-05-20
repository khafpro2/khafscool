let demoActive = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function markDemoFallback() {
  if (demoActive) return;
  demoActive = true;
  emit();
}

export function clearDemoMode() {
  if (!demoActive) return;
  demoActive = false;
  emit();
}

export function isDemoModeActive() {
  return demoActive;
}

export function subscribeDemoMode(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
