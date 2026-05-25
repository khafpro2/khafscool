import { expect, test } from '@playwright/test';

const CONSENT_KEY = 'ama:cookie-consent';

test.describe('Bannière cookies', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, CONSENT_KEY);
  });

  test('affiche la bannière puis la masque après acceptation', async ({ page }) => {
    // Bannière masquée sur `/` (accueil plein écran) — test sur une page interne.
    await page.goto('/courses');
    const banner = page.getByRole('dialog', { name: /Cookies et stockage local/i });
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(banner.getByRole('link', { name: 'En savoir plus' })).toHaveAttribute(
      'href',
      '/legal/confidentialite'
    );
    await banner.getByRole('button', { name: /J'ai compris/i }).click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_KEY);
    expect(stored).toContain('"version":1');
  });

  test('lien Préférences sur l’accueil ouvre la modale cookies', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Préférences' }).click();
    const modal = page.getByRole('dialog', { name: /Cookies et stockage local/i });
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await expect(modal.getByRole('link', { name: 'En savoir plus' })).toHaveAttribute(
      'href',
      '/legal/confidentialite'
    );
    await modal.getByRole('button', { name: /J'ai compris/i }).click();
    await expect(modal).toBeHidden();
  });

  test('ne réaffiche pas la bannière si le consentement est enregistré', async ({ page }) => {
    await page.addInitScript(
      (key) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ version: 1, acceptedAt: new Date().toISOString() })
        );
      },
      CONSENT_KEY
    );
    await page.goto('/courses');
    await expect(page.getByRole('dialog', { name: /Cookies et stockage local/i })).toBeHidden();
  });
});
