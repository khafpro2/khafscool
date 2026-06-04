let apiUnavailable = false;
let consecutiveFailures = 0;
const listeners = new Set<() => void>();

const FAILURE_THRESHOLD = 2;

/** Seules les pannes réseau ou serveur (5xx) doivent afficher « API indisponible ». */
export function shouldMarkApiUnavailable(httpStatus?: number): boolean {
  if (httpStatus == null) return true;
  return httpStatus >= 500 || httpStatus === 408;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function recordApiSuccess() {
  consecutiveFailures = 0;
  if (apiUnavailable) {
    apiUnavailable = false;
    emit();
  }
}

export function recordApiFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD && !apiUnavailable) {
    apiUnavailable = true;
    emit();
  }
}

export function setApiUnavailable(unavailable: boolean) {
  if (apiUnavailable === unavailable) return;
  apiUnavailable = unavailable;
  if (!unavailable) consecutiveFailures = 0;
  emit();
}

export function isApiUnavailable() {
  return apiUnavailable;
}

export function subscribeApiStatus(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
