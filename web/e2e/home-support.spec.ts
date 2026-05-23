import { expect, test } from '@playwright/test';

test.describe('Accueil — soutenir le projet', () => {
  test('affiche la carte don avec les trois modes de paiement', async ({ page }) => {
    await page.goto('/');

    const card = page.getByTestId('home-support-modes');
    await expect(card).toBeVisible();
    await expect(card.getByText('Carte bancaire', { exact: true })).toBeVisible();
    await expect(card.getByText('PayPal', { exact: true })).toBeVisible();
    await expect(card.getByText('Virement SEPA', { exact: true })).toBeVisible();

    const cta = page.getByRole('link', { name: 'Faire un don' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/soutenir');
  });
});
