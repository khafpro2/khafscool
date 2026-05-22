import { expect, test } from '@playwright/test';

test.describe('Page Soutenir', () => {
  test('affiche la page de don volontaire et les montants suggérés', async ({ page }) => {
    await page.goto('/soutenir');
    await expect(page.getByRole('heading', { name: 'Soutenir MDM Academy Pro' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('100 % gratuite', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /5\s*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /10\s*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /20\s*€/ })).toBeVisible();
  });

  test('expose le lien footer « Faire un don »', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Faire un don' })).toBeVisible();
  });
});
