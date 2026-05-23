import { expect, test } from '@playwright/test';

test.describe('Accueil — soutenir le projet', () => {
  test('affiche les montants suggérés et le lien choix mode de paiement', async ({ page }) => {
    await page.goto('/');

    const section = page.getByTestId('home-support-section');
    await expect(section).toBeVisible();

    const amounts = section.getByTestId('home-support-amounts');
    await expect(amounts).toBeVisible();
    await expect(section.getByTestId('home-support-amount-5')).toBeVisible();
    await expect(section.getByTestId('home-support-amount-10')).toBeVisible();
    await expect(section.getByTestId('home-support-amount-20')).toBeVisible();

    await expect(section.getByTestId('home-support-amount-10')).toHaveAttribute('href', '/soutenir?amount=10');

    const cta = section.getByRole('link', { name: 'Choisir mode de paiement' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/soutenir?amount=10');
  });
});
