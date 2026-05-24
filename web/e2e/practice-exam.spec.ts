import { test, expect } from '@playwright/test';

test.describe('Examen blanc parcours', () => {
  test('affiche le quiz en mode démo', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/examen');

    await expect(page.getByRole('heading', { name: /Examen blanc|Parcours Apple/i }).first()).toBeVisible();
    await expect(page.getByText(/Pool de \d+ questions · 10 tirées au hasard/i).first()).toBeVisible();
    await expect(page.getByText(/Question 1 sur 10/i)).toBeVisible();
  });

  test('lien depuis la fiche révision démo', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/revision');

    await expect(page.getByRole('link', { name: /Examen blanc/i })).toBeVisible();
    await page.getByRole('link', { name: /Examen blanc/i }).click();
    await expect(page).toHaveURL(/\/courses\/apple-cert-prep\/examen/);
  });

  test('fil d’Ariane fiche révision + examen', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/examen');

    await expect(page.getByRole('navigation', { name: "Fil d'Ariane" })).toBeVisible();
    await expect(page.getByRole('link', { name: /Fiche révision/i })).toBeVisible();
  });
});
