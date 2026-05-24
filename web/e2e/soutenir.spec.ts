import { expect, test } from '@playwright/test';
import {
  fulfillJsonRoute,
  isDonationsCheckoutRequest,
  isDonationsStatusRequest,
} from './helpers/proxy-routes';

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

test.describe('Page Soutenir', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(isDonationsStatusRequest, async (route) => {
      await fulfillJsonRoute(route, mockDonationStatusFallback);
    });
  });

  test('affiche la grille de choix montant et mode de paiement', async ({ page }) => {
    await page.goto('/soutenir');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Soutenir MDM Academy Pro' }),
    ).toBeVisible({ timeout: 15_000 });

    const grid = page.getByTestId('donation-choice-grid');
    await expect(grid).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '1. Choisissez un montant' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '2. Choisissez un mode de paiement' })).toBeVisible();
    await expect(page.getByTestId('donation-amount-5')).toBeVisible();
    await expect(page.getByTestId('donation-amount-10')).toBeVisible();
    await expect(page.getByTestId('donation-amount-20')).toBeVisible();
    await expect(page.getByTestId('donation-amount-custom')).toBeVisible();
    await expect(page.getByTestId('donation-mode-carte')).toBeVisible();
    await expect(page.getByTestId('donation-mode-paypal')).toBeVisible();
    await expect(page.getByTestId('donation-mode-virement')).toBeVisible();
  });

  test('pré-sélectionne le montant via ?amount=10', async ({ page }) => {
    await page.goto('/soutenir?amount=10');
    await expect(page.getByTestId('donation-choice-grid')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('donation-amount-10')).toHaveClass(/is-selected/);
    await expect(page.getByText('10 €', { exact: false }).first()).toBeVisible();
  });

  test('affiche le CTA carte avec montant sélectionné (fallback)', async ({ page }) => {
    await page.goto('/soutenir#carte');
    await expect(page.getByTestId('donation-mode-carte')).toHaveClass(/is-selected/, { timeout: 15_000 });
    await expect(page.getByText('sécurisé via Stripe', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faire un don (lien externe)' })).toBeVisible();
  });

  test('affiche la section virement avec IBAN et référence montant', async ({ page }) => {
    await page.goto('/soutenir?amount=10#virement');
    await expect(page.getByTestId('donation-mode-virement')).toHaveClass(/is-selected/, { timeout: 15_000 });
    await expect(page.getByTestId('bank-iban')).toContainText('FR76 2823 3000 0193 2563 3272 239');
    await expect(page.getByTestId('bank-copy-iban-button')).toBeVisible();
    await expect(page.getByTestId('bank-copy-iban-button')).toHaveText('Copier IBAN');
    await expect(page.getByTestId('bank-reference')).toContainText('Soutien MDM Academy - 10€');
  });

  test('affiche PayPal avec montant dans l’URL quand configuré', async ({ page }) => {
    await page.goto('/soutenir?amount=10#paypal');
    await expect(page.getByTestId('donation-mode-paypal')).toHaveClass(/is-selected/, { timeout: 15_000 });
    await expect(page.getByText('sécurisée par PayPal', { exact: false })).toBeVisible();
    const paypalButton = page.getByTestId('paypal-donate-button');
    await expect(paypalButton).toBeVisible();
    await expect(paypalButton).toHaveAttribute('href', /10/);
    await expect(paypalButton).toHaveText('Ouvrir PayPal');
    await expect(page.getByText('Montant 10', { exact: false })).toBeVisible();
  });

  test('cliquer sur PayPal change le CTA visible', async ({ page }) => {
    await page.goto('/soutenir?amount=10');
    await expect(page.getByTestId('donation-choice-grid')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('donation-mode-carte')).toHaveClass(/is-selected/);
    await expect(page.getByRole('link', { name: 'Faire un don (lien externe)' })).toBeVisible();
    await expect(page.getByTestId('paypal-donate-button')).toHaveCount(0);

    await page.getByTestId('donation-mode-paypal').click();
    await expect(page.getByTestId('donation-mode-paypal')).toHaveClass(/is-selected/);
    await expect(page.getByTestId('paypal-donate-button')).toBeVisible();
    await expect(page.getByTestId('paypal-donate-button')).toHaveText('Ouvrir PayPal');
    await expect(page.getByRole('link', { name: 'Faire un don (lien externe)' })).toHaveCount(0);
  });

  test('affiche la FAQ dons (5 questions)', async ({ page }) => {
    await page.goto('/soutenir');
    await expect(page.getByRole('heading', { level: 2, name: 'FAQ dons' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('La plateforme est-elle vraiment gratuite ?')).toBeVisible();
    await expect(page.getByText('Puis-je obtenir un reçu fiscal ?')).toBeVisible();
    await page.getByText('Puis-je obtenir un reçu fiscal ?').click();
    await expect(
      page.getByText('MDM Academy Pro n’est pas configurée comme association', { exact: false }),
    ).toBeVisible();
  });

  test('expose le lien footer « Faire un don »', async ({ page }) => {
    await page.goto('/');
    const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'Faire un don' });
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', '/soutenir');
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
  test('affiche le bouton Donner X € quand Stripe est actif (mock API)', async ({ page }) => {
    await page.route(isDonationsStatusRequest, async (route) => {
      await fulfillJsonRoute(route, mockDonationStatusLive);
    });

    await page.goto('/soutenir?amount=10#carte');
    await expect(page.getByTestId('stripe-donate-button')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('stripe-donate-button')).toContainText('Payer');
    await expect(page.getByTestId('stripe-donate-button')).toContainText('par carte');
    await expect(page.getByText('Redirection vers Stripe Checkout', { exact: false })).toBeVisible();
  });

  test('affiche un message clair sans Stripe ni lien externe (mock API)', async ({ page }) => {
    await page.route(isDonationsStatusRequest, async (route) => {
      await fulfillJsonRoute(route, mockDonationStatusUnavailable);
    });

    await page.goto('/soutenir#carte');
    await expect(page.getByText('Paiement par carte non activé', { exact: false })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: 'docs/DONATIONS.md' })).toBeVisible();
    await expect(page.getByTestId('stripe-donate-button')).toHaveCount(0);
  });

  test('affiche un spinner pendant create-checkout-session (mock API)', async ({ page }) => {
    await page.route(isDonationsStatusRequest, async (route) => {
      await fulfillJsonRoute(route, mockDonationStatusLive);
    });

    await page.route(isDonationsCheckoutRequest, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ checkoutUrl: 'https://checkout.stripe.com/e2e-mock' }),
      });
    });

    await page.goto('/soutenir?amount=10#carte');
    const button = page.getByTestId('stripe-donate-button');
    await expect(button).toBeVisible({ timeout: 15_000 });
    await button.click();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toContainText('Redirection vers Stripe');
  });

  test('affiche une erreur FR si create-checkout-session échoue (mock API)', async ({ page }) => {
    await page.route(isDonationsStatusRequest, async (route) => {
      await fulfillJsonRoute(route, mockDonationStatusLive);
    });

    await page.route(isDonationsCheckoutRequest, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Service de paiement indisponible.' }),
      });
    });

    await page.goto('/soutenir?amount=10#carte');
    const button = page.getByTestId('stripe-donate-button');
    await expect(button).toBeVisible({ timeout: 15_000 });
    await button.click();
    await expect(page.locator('.donation-error')).toContainText('Service de paiement indisponible', {
      timeout: 10_000,
    });
  });
});
