import { expect, test } from '@playwright/test';

test.describe('Accueil — soutenir le projet', () => {
  test('affiche la carte don avec les trois modes de paiement', async ({ page }) => {
    await page.goto('/');

    const section = page.getByTestId('home-support-section');
    const card = section.getByTestId('home-support-modes');
    await expect(card).toBeVisible();
    await expect(card.getByText('Carte bancaire', { exact: true })).toBeVisible();
    await expect(card.getByText('PayPal', { exact: true })).toBeVisible();
    await expect(card.getByText('Virement SEPA', { exact: true })).toBeVisible();

    const cta = section.getByRole('link', { name: 'Faire un don' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/soutenir');
  });
});
