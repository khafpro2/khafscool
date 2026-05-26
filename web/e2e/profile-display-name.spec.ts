import { expect, test } from '@playwright/test';

test.describe('Profil — nom affiché (démo)', () => {
  test('affiche le champ nom en lecture seule en mode démo', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(/Profil en mode démo/i)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByText('Nom affiché', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toHaveCount(0);
  });
});

test.describe('Certificat — impression', () => {
  test('bouton Imprimer avec aria-label FR', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep/certificate');
    await expect(
      page.getByRole('button', { name: /Imprimer le certificat ou l'enregistrer en PDF/i })
    ).toBeVisible();
  });
});
