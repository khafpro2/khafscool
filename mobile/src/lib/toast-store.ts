export type ToastKind = 'points' | 'badge' | 'quest' | 'success';

export type ToastInput = {
  kind: ToastKind;
  title: string;
  body?: string;
  durationMs?: number;
};

export type ToastRecord = ToastInput & {
  id: string;
};

const DEFAULT_DURATION_MS = 5200;
const MAX_VISIBLE = 4;

let toasts: ToastRecord[] = [];
const listeners = new Set<() => void>();
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): readonly ToastRecord[] {
  return toasts;
}

export function showToast(input: ToastInput) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  toasts = [{ ...input, id }, ...toasts].slice(0, MAX_VISIBLE);
  emit();

  const existing = dismissTimers.get(id);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    dismissToast(id);
    dismissTimers.delete(id);
  }, input.durationMs ?? DEFAULT_DURATION_MS);
  dismissTimers.set(id, timer);
}

export function dismissToast(id: string) {
  const timer = dismissTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    dismissTimers.delete(id);
  }
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}
