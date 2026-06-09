import { expect, test } from '@playwright/test';

test.describe('Pages 404 et erreur', () => {

  test('route inconnue affiche la page 404', async ({ page }) => {
    const response = await page.goto('/cette-page-nexiste-pas');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /Cette page n.existe pas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Retour à l'accueil/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Voir les parcours/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Tableau de bord/i })).toBeVisible();
  });

  test('slug de cours invalide renvoie 404', async ({ page }) => {
    const response = await page.goto('/courses/parcours-qui-nexiste-pas');
    expect(response?.status()).toBe(404);
  });

  test('slug d\'examen invalide renvoie 404', async ({ page }) => {
    const response = await page.goto('/courses/parcours-inexistant/examen');
    expect(response?.status()).toBe(404);
  });

  test('page 404 a des liens fonctionnels', async ({ page }) => {
    await page.goto('/inexistant-xyz');
    await page.getByRole('link', { name: /Voir les parcours/i }).click();
    await expect(page).toHaveURL('/courses');
  });

});
