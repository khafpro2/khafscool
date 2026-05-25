import { expect, test } from '@playwright/test';

const CONSENT_KEY = 'ama:cookie-consent';
const ANALYTICS_KEY = 'analytics-opt-in';

test.describe('Bannière analytics opt-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ consentKey, analyticsKey }: { consentKey: string; analyticsKey: string }) => {
        window.localStorage.removeItem(consentKey);
        window.localStorage.removeItem(analyticsKey);
      },
      { consentKey: CONSENT_KEY, analyticsKey: ANALYTICS_KEY }
    );
  });

  test('s’affiche après acceptation des cookies puis enregistre le choix', async ({ page }) => {
    await page.goto('/courses');
    const cookieBanner = page.getByRole('dialog', { name: /Cookies et stockage local/i });
    await expect(cookieBanner).toBeVisible({ timeout: 15_000 });
    await cookieBanner.getByRole('button', { name: /J'ai compris/i }).click();
    await expect(cookieBanner).toBeHidden();

    const analyticsBanner = page.getByRole('dialog', { name: /Mesure d'audience/i });
    await expect(analyticsBanner).toBeVisible();
    await expect(analyticsBanner.getByText(/Aucun tracking tiers pour l'instant/i)).toBeVisible();
    await expect(analyticsBanner.getByRole('link', { name: 'Confidentialité' })).toHaveAttribute(
      'href',
      '/legal/confidentialite'
    );

    await analyticsBanner.getByRole('button', { name: 'Refuser' }).click();
    await expect(analyticsBanner).toBeHidden();

    const stored = await page.evaluate((key) => window.localStorage.getItem(key), ANALYTICS_KEY);
    expect(stored).toBe('declined');
  });

  test('ne réaffiche pas la bannière si le choix est déjà enregistré', async ({ page }) => {
    await page.addInitScript(
      ({ consentKey, analyticsKey }: { consentKey: string; analyticsKey: string }) => {
        window.localStorage.setItem(
          consentKey,
          JSON.stringify({ version: 1, acceptedAt: new Date().toISOString() })
        );
        window.localStorage.setItem(analyticsKey, 'accepted');
      },
      { consentKey: CONSENT_KEY, analyticsKey: ANALYTICS_KEY }
    );
    await page.goto('/courses');
    await expect(page.getByRole('dialog', { name: /Mesure d'audience/i })).toBeHidden();
  });
});
