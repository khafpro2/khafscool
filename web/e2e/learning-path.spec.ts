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

  test('recherche catalogue filtre par mot-clé', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByRole('searchbox', { name: /rechercher/i })).toBeVisible();
    await page.getByRole('searchbox', { name: /rechercher/i }).fill('jamf-pro');
    await expect(page.getByRole('link', { name: /Jamf Pro/i }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Aucun parcours ne correspond/i })).not.toBeVisible();
  });

  test('/pricing redirige vers /courses', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/courses$/);
  });

  test('fil d\'Ariane visible sur page cours', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep');
    const breadcrumb = page.getByRole('navigation', { name: /fil d'Ariane/i });
    await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
    await expect(breadcrumb.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Parcours' })).toBeVisible();
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
    const breadcrumb = page.getByRole('navigation', { name: /fil d'Ariane/i });
    await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
    await expect(breadcrumb.getByRole('link', { name: 'Parcours', exact: true })).toBeVisible();
    await expect(breadcrumb.getByText('Certificat')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Apprenant démo/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('article', { name: /Certificat de complétion/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Imprimer.*PDF/i })
    ).toBeVisible();
  });

  test('lien « Aller au contenu » visible au focus', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: /Aller au contenu/i });
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
