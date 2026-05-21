import { expect, test } from '@playwright/test';

test.describe('Parcours d’apprentissage — smoke', () => {
  test('accueil charge', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Maîtrise Apple, Jamf Pro et Intune/i })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /Commencer gratuitement/i })).toBeVisible();
  });

  test('/courses répond 200', async ({ page }) => {
    const response = await page.goto('/courses');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Trois parcours pour devenir expert MDM/i })).toBeVisible();
  });

  test('/pricing redirige vers /courses', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/courses$/);
  });

  test('page complétion parcours affiche le partage', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/complete');
    await expect(page.getByRole('heading', { name: /Bravo !/i })).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: /Partager ma réussite/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Télécharger.*certificat/i })
    ).toBeVisible();
  });

  test('certificat imprimable en mode démo', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/certificate');
    await expect(page.getByRole('heading', { name: /Apprenant démo/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('article', { name: /Certificat de complétion/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Imprimer.*PDF/i })
    ).toBeVisible();
  });
});
