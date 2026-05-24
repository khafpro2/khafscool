import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { expect, test } from '@playwright/test';

test.describe('Examen blanc integration (API live)', () => {
  test.skip(!process.env.E2E_LIVE_API, 'Set E2E_LIVE_API=1 with API + Postgres seedés');

  test('compte démo avec parcours Apple complété accède à l’examen', async ({ page }) => {
    await page.goto('/auth?redirect=/courses/apple-cert-prep/examen');
    await page.getByLabel(/Email/i).fill(DEMO_ACCOUNT.email);
    await page.getByLabel(/Mot de passe/i).fill(DEMO_ACCOUNT.password);
    await page.getByRole('button', { name: /Se connecter/i }).first().click();

    await expect(page).toHaveURL(/\/courses\/apple-cert-prep\/examen/, { timeout: 20_000 });
    await expect(page.getByText(/Examen blanc verrouillé/i)).toHaveCount(0);
    await expect(page.getByText(/Question 1 sur 10/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Pool de \d+ questions/i)).toBeVisible();
  });
});
