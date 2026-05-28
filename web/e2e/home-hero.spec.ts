import { expect, test, type Page } from '@playwright/test';

async function expectHeroMacbookPoster(page: Page) {
  const poster = page.getByTestId('hero-macbook-poster');
  await expect(poster).toBeVisible({ timeout: 15_000 });
  await expect(poster.locator('img')).toBeVisible();
  await expect(poster.getByText('Hello', { exact: true })).toBeVisible();
}

test.describe('Accueil — hero MacBook', () => {
  test('affiche le poster MacBook, Hello sur écran et titre animé', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expectHeroMacbookPoster(page);

    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
  });

  test('poster et overlay Hello alignés sur mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expectHeroMacbookPoster(page);
  });
});
