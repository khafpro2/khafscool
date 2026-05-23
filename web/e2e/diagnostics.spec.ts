import { expect, test } from '@playwright/test';

test.describe('Diagnostics — page enrichie', () => {
  test('affiche la synthèse des contrôles et le lien stack locale', async ({ page }) => {
    await page.goto('/diagnostics');
    await expect(page.getByRole('heading', { name: /Diagnostics MVP/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Liste des contrôles')).toBeVisible();
    await expect(page.getByText('Santé API (/health)')).toBeVisible();
    await expect(page.getByText('OAuth SSO (/auth/oauth/status)')).toBeVisible();
    await expect(page.getByText('État des fournisseurs SSO')).toBeVisible();
    await expect(page.getByRole('link', { name: /Docs stack locale/i })).toBeVisible();
    await expect(page.getByText('Démarrage dev-stack')).toBeVisible();
  });
});
