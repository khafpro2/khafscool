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

  test('recherche globale dans le header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const search = page.getByRole('combobox', { name: /Rechercher dans le glossaire MDM/i });
    await expect(search).toBeVisible({ timeout: 15_000 });
    await search.fill('SCEP');
    await expect(page.getByRole('option').filter({ hasText: 'SCEP (Simple Certificate' })).toHaveCount(1);
    await expect(page.getByRole('listbox').locator('[role="option"]').first()).toBeVisible();
  });
});

test.describe('Catalogue parcours — métadonnées', () => {
  test('affiche durée, modules et questions totales', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText(/~\d+ min · 4 modules · 40 questions/i)).toHaveCount(3, {
      timeout: 15_000,
    });
  });
});
