import { expect, test } from '@playwright/test';

import { WHATS_NEW_BANNER_STORAGE_KEY } from '../src/lib/whats-new-banner';

test.describe('Accueil — bandeau Nouveau v0.2.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, WHATS_NEW_BANNER_STORAGE_KEY);
  });

  test('affiche le bandeau et le masque après fermeture', async ({ page }) => {
    await page.goto('/');

    const banner = page.getByTestId('home-whats-new-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Nouveau · v0.2.1');
    await expect(banner).toContainText('Examen blanc');
    await expect(banner.getByRole('link', { name: 'glossaire MDM' })).toHaveAttribute(
      'href',
      '/resources/glossaire',
    );

    await page.getByTestId('home-whats-new-dismiss').click();
    await expect(banner).not.toBeVisible();

    const stored = await page.evaluate((key) => window.localStorage.getItem(key), WHATS_NEW_BANNER_STORAGE_KEY);
    expect(stored).toBe('1');
  });

  test('ne réaffiche pas le bandeau après dismiss localStorage', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(key, '1');
    }, WHATS_NEW_BANNER_STORAGE_KEY);

    await page.goto('/');
    await expect(page.getByTestId('home-whats-new-banner')).not.toBeVisible();
  });
});
