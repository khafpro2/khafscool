import { expect, test } from '@playwright/test';

test.describe('Profil — certificats', () => {
  test('affiche les liens certificat pour les parcours terminés en mode démo', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Parcours terminés' })).toBeVisible({
      timeout: 15_000,
    });
    const certLink = page.getByRole('link', { name: /Voir le certificat/i }).first();
    await expect(certLink).toBeVisible();
    await expect(certLink).toHaveAttribute('href', /\/courses\/[^/]+\/certificate$/);
  });

});
