export const WHATS_NEW_BANNER_VERSION = '0.3.16';

export const WHATS_NEW_BANNER_STORAGE_KEY = `ama:whats-new-${WHATS_NEW_BANNER_VERSION}-dismissed`;

export function isWhatsNewBannerDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(WHATS_NEW_BANNER_STORAGE_KEY) === '1';
}

export function dismissWhatsNewBanner(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WHATS_NEW_BANNER_STORAGE_KEY, '1');
}
