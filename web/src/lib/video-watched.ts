const STORAGE_PREFIX = 'video-watched-';

export const VIDEO_WATCHED_EVENT = 'ama-video-watched';

export function videoWatchedStorageKey(moduleId: string): string {
  return `${STORAGE_PREFIX}${moduleId}`;
}

export function isVideoWatched(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(videoWatchedStorageKey(moduleId)) === '1';
  } catch {
    return false;
  }
}

export function markVideoWatched(moduleId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(videoWatchedStorageKey(moduleId), '1');
    window.dispatchEvent(
      new CustomEvent(VIDEO_WATCHED_EVENT, { detail: { moduleId } })
    );
  } catch {
    /* localStorage indisponible (mode privé strict) */
  }
}
