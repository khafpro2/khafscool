import { expect, test } from '@playwright/test';

test.describe('Parcours — module actif unique', () => {
  test('affiche un seul QuizPanel sur la page cours', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep');
    await expect(page.getByRole('article', { name: /Quiz de l'unité/i }).or(page.locator('.quiz-panel'))).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.quiz-panel')).toHaveCount(1);
  });

  test('sidebar liste les unités avec statuts', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep');
    const sidebar = page.getByRole('navigation', { name: /Unités du parcours/i });
    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    await expect(sidebar.getByRole('button', { name: /Unité 1/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /Unité 2/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /Unité 3/i })).toBeVisible();
  });
});
