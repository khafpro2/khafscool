import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:4000';

const mockDonationStatusFallback = {
  mode: 'fallback' as const,
  stripe: { configured: false, checkoutEnabled: false },
  paypal: { status: 'unavailable' as const },
  fallbackUrl: 'https://example.com/don',
  suggestedAmountsCents: [500, 1000, 2000],
  message: 'Dons via lien externe en attendant Stripe.',
};

const mockDonationStatusLive = {
  mode: 'live' as const,
  stripe: { configured: true, checkoutEnabled: true },
  paypal: { status: 'configured' as const },
  fallbackUrl: null,
  suggestedAmountsCents: [500, 1000, 2000],
};

const mockDonationStatusUnavailable = {
  mode: 'unavailable' as const,
  stripe: { configured: false, checkoutEnabled: false },
  paypal: { status: 'unavailable' as const },
  fallbackUrl: null,
  suggestedAmountsCents: [500, 1000, 2000],
  message: 'Bientôt disponible — merci pour votre intérêt !',
};

const MOCK_PAYPAL_URL = 'https://www.paypal.com/donate/?hosted_button_id=e2e_mock';

test.describe('Page Soutenir', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API_BASE}/donations/status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDonationStatusFallback),
      });
    });
  });

  test('affiche la section carte bancaire et les montants suggérés', async ({ page }) => {
    await page.goto('/soutenir#carte');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Soutenir MDM Academy Pro' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('heading', { level: 2, name: 'Carte bancaire (Visa, Mastercard…)' }),
    ).toBeVisible();
    await expect(page.getByText('sécurisé via Stripe', { exact: false })).toBeVisible();
    await expect(page.getByText('100 % gratuite', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /5[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /10[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /20[\s\u00a0]*€/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faire un don (lien externe)' })).toBeVisible();
  });

  test('affiche la section virement bancaire et le bouton copier IBAN', async ({ page }) => {
    await page.goto('/soutenir#virement');
    await expect(page.getByRole('heading', { level: 2, name: 'Virement bancaire (SEPA)' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('bank-iban')).toContainText('FR76 2823 3000 0193 2563 3272 239');
    await expect(page.getByRole('button', { name: 'Copier l’IBAN' })).toBeVisible();
    await expect(page.getByTestId('bank-reference')).toHaveText('Soutien MDM Academy');
  });

  test('affiche la section PayPal quand l’URL est configurée (mock env)', async ({ page }) => {
    await page.goto('/soutenir#paypal');
    await expect(page.getByRole('heading', { level: 2, name: 'PayPal (don volontaire)' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('sécurisée par PayPal', { exact: false })).toBeVisible();
    await expect(page.getByText('MDM Academy', { exact: false })).toBeVisible();
    await expect(page.getByTestId('paypal-donate-button')).toBeVisible();
    await expect(page.getByTestId('paypal-donate-button')).toHaveAttribute('href', MOCK_PAYPAL_URL);
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

test.describe('Page Soutenir — paiement CB Stripe', () => {
  test('affiche le bouton payer par carte quand Stripe est actif (mock API)', async ({ page }) => {
    await page.route(`${API_BASE}/donations/status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDonationStatusLive),
      });
    });

    await page.goto('/soutenir#carte');
    await expect(page.getByRole('button', { name: /Payer .* par carte/ })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Redirection vers Stripe Checkout', { exact: false })).toBeVisible();
  });

  test('affiche un message clair sans Stripe ni lien externe (mock API)', async ({ page }) => {
    await page.route(`${API_BASE}/donations/status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDonationStatusUnavailable),
      });
    });

    await page.goto('/soutenir#carte');
    await expect(page.getByText('Paiement par carte non activé', { exact: false })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: 'docs/DONATIONS.md' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Payer .* par carte/ })).toHaveCount(0);
  });
});
