import { test, expect } from '@playwright/test';

test.describe('Fiche révision parcours', () => {
  test('affiche la synthèse des points clés en mode démo', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/revision');

    await expect(page.getByRole('heading', { name: /Fiche révision|Parcours Apple/i }).first()).toBeVisible();
    await expect(page.getByText(/points clés/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Imprimer \/ PDF/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Glossaire MDM/i })).toBeVisible();
  });

  test('lien depuis la page de complétion démo', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/complete');

    await expect(page.getByRole('link', { name: /Fiche révision/i })).toBeVisible();
    await page.getByRole('link', { name: /Fiche révision/i }).click();
    await expect(page).toHaveURL(/\/courses\/apple-cert-prep\/revision/);
  });

  test('bouton partager la fiche révision', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/revision');
    await expect(page.getByRole('button', { name: /Imprimer \/ PDF/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Partager la fiche/i })).toBeVisible();
  });
});
