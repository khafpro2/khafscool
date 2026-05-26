import { expect, test } from '@playwright/test';

test.describe('Donations integration (API live)', () => {
  test.skip(!process.env.E2E_LIVE_API, 'Set E2E_LIVE_API=1 with API démarrée');

  test('charge le statut dons depuis l’API via le proxy BFF', async ({ page }) => {
    await page.goto('/soutenir');
    await expect(page.getByRole('heading', { level: 1, name: 'Soutenir MDM Academy Pro' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('donation-choice-grid')).toBeVisible();
    await expect(page.getByTestId('donation-amount-10')).toBeVisible();
  });
});
