import { expect, test } from '@playwright/test';

test.describe('Page auth — smoke', () => {
  test('affiche le formulaire avec email et mot de passe', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /Connecte-toi en quelques secondes/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Se connecter par email/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Se connecter/i }).first()).toBeVisible();
  });
});
