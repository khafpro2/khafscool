import type { Page } from '@playwright/test';

export const COOKIE_CONSENT_KEY = 'ama:cookie-consent';

export async function seedCookieConsent(page: Page) {
  await page.addInitScript((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ version: 1, acceptedAt: new Date().toISOString() })
    );
  }, COOKIE_CONSENT_KEY);
}
