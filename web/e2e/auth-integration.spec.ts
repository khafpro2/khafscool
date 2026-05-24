import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { expect, test } from '@playwright/test';

test.describe('Auth integration (API live)', () => {
  test.skip(!process.env.E2E_LIVE_API, 'Set E2E_LIVE_API=1 with API + Postgres seedés');

  test('connexion démo puis tableau de bord', async ({ page }) => {
    await page.goto('/auth?redirect=/dashboard');

    await page.getByLabel(/Email/i).fill(DEMO_ACCOUNT.email);
    await page.getByLabel(/Mot de passe/i).fill(DEMO_ACCOUNT.password);
    await page.getByRole('button', { name: /Se connecter/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Mon apprentissage/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
