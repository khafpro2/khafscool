import { expect, test } from '@playwright/test';

test.describe('Accueil — écran de bienvenue', () => {
  test('affiche Hello animé, tagline et pistes MDM', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Jamf/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Intune/i })).toBeVisible();
    await expect(page.getByTestId('hero-macbook-poster')).toHaveCount(0);
  });

  test('Hello et pistes visibles sur mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
  });
});
