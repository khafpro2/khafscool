import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:4000';

const mockDonationStatus = {
  mode: 'fallback' as const,
  stripe: { configured: false, checkoutEnabled: false },
  fallbackUrl: 'https://example.com/don',
  suggestedAmountsCents: [500, 1000, 2000],
  message: 'Dons via lien externe en attendant Stripe.',
};

test.describe('Page Soutenir', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API_BASE}/donations/status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDonationStatus),
      });
    });
  });

  test('affiche la page de don volontaire et les montants suggérés', async ({ page }) => {
    await page.goto('/soutenir');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Soutenir MDM Academy Pro' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('100 % gratuite', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /5[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /10[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /20[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faire un don (lien externe)' })).toBeVisible();
  });

  test('expose le lien footer « Faire un don »', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Faire un don' })).toBeVisible();
  });

  test('affiche la page merci après don Stripe', async ({ page }) => {
    await page.goto('/soutenir/merci?session_id=cs_test_123');
    await expect(page.getByRole('heading', { level: 1, name: 'Merci pour votre soutien !' })).toBeVisible();
    await expect(page.getByText('Paiement confirmé')).toBeVisible();
    await expect(page.getByRole('link', { name: "Retour à l'accueil", exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir les parcours' })).toBeVisible();
  });

  test('affiche la page annulation de don', async ({ page }) => {
    await page.goto('/soutenir/annule');
    await expect(page.getByRole('heading', { level: 1, name: 'Don annulé' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Revenir à la page Soutenir' })).toBeVisible();
    await expect(page.getByRole('link', { name: "Retour à l'accueil", exact: true })).toBeVisible();
  });
});
