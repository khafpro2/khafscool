import { expect, test } from '@playwright/test';

test.describe('Glossaire MDM', () => {
  test('affiche le glossaire avec recherche', async ({ page }) => {
    await page.goto('/resources/glossaire');
    await expect(page.getByRole('heading', { name: /Glossaire MDM Apple/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('ABM (Apple Business Manager)', { exact: false })).toBeVisible();
    await page.getByRole('searchbox').fill('SCEP');
    await expect(page.getByText('SCEP (Simple Certificate Enrollment Protocol)', { exact: false })).toBeVisible();
  });

  test('lien depuis la page ressources', async ({ page }) => {
    await page.goto('/resources');
    await expect(page.getByRole('link', { name: /Glossaire MDM/i })).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Catalogue parcours — métadonnées', () => {
  test('affiche modules et questions par module', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText(/3 modules · 10 questions\/module/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
