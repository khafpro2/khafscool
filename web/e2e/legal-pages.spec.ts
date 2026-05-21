import { expect, test } from '@playwright/test';

test.describe('Pages légales', () => {
  test('affiche la politique de confidentialité', async ({ page }) => {
    await page.goto('/legal/confidentialite');
    await expect(page.getByRole('heading', { name: 'Politique de confidentialité' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('ne vend pas vos données', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: /Conditions d’utilisation/i })).toBeVisible();
  });

  test('affiche les conditions d’utilisation', async ({ page }) => {
    await page.goto('/legal/conditions');
    await expect(page.getByRole('heading', { name: 'Conditions d’utilisation' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('formation gratuite', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: /Politique de confidentialité/i })).toBeVisible();
  });

  test('expose les liens légaux dans le footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Confidentialité' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Conditions' })).toBeVisible();
  });
});
