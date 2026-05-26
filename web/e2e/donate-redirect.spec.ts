import { expect, test } from '@playwright/test';

test.describe('Redirect /donate → /soutenir', () => {
  test('préserve la query string', async ({ page }) => {
    await page.goto('/donate?amount=10');
    await expect(page).toHaveURL(/\/soutenir\?amount=10/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1, name: 'Soutenir MDM Academy Pro' })).toBeVisible();
  });

  test('préserve la query string et le fragment', async ({ page }) => {
    await page.goto('/donate?amount=10#paypal');
    await expect(page).toHaveURL(/\/soutenir\?amount=10#paypal/, { timeout: 15_000 });
    await expect(page.getByTestId('donation-mode-paypal')).toHaveClass(/is-selected/, { timeout: 15_000 });
  });

  test('redirige sans paramètres vers /soutenir', async ({ page }) => {
    await page.goto('/donate');
    await expect(page).toHaveURL(/\/soutenir\/?$/, { timeout: 15_000 });
  });
});
