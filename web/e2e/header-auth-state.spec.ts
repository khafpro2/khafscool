import { expect, test } from '@playwright/test';

test.describe('Header — état authentification', () => {

  test('affiche Connexion quand non connecté', async ({ page }) => {
    await page.goto('/courses');
    const actions = page.locator('.site-actions');
    await expect(actions.getByRole('link', { name: 'Connexion' })).toBeVisible();
    await expect(actions.getByRole('link', { name: 'Profil' })).toHaveCount(0);
  });

  test('bouton Connexion pointe vers /auth', async ({ page }) => {
    await page.goto('/courses');
    const link = page.locator('.site-actions').getByRole('link', { name: 'Connexion' });
    await expect(link).toHaveAttribute('href', '/auth');
  });

  test('header absent sur la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-header')).toHaveCount(0);
  });

  test('thème toggle présent dans les actions du header', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('.site-actions .theme-toggle')).toBeVisible();
  });

});
