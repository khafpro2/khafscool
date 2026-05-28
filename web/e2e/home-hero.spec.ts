import { expect, test } from '@playwright/test';

test.describe('Accueil — hero MacBook', () => {
  test('affiche le poster MacBook, Hello sur écran et titre animé', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();

    const poster = page.getByTestId('hero-macbook-poster');
    await expect(poster).toBeVisible({ timeout: 15_000 });

    await expect(poster.locator('img')).toBeVisible();
    await expect(poster.getByText('Hello', { exact: true })).toBeVisible();

    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
  });
});
