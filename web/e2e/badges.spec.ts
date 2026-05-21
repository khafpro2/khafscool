import { expect, test } from '@playwright/test';

test.describe('Badges — filtre par piste', () => {
  test('filtre Apple masque le badge Jamf en mode démo', async ({ page }) => {
    await page.goto('/badges');
    await expect(page.getByRole('heading', { name: /super-badges MDM Academy/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByRole('heading', { name: 'Ingénieur Jamf' })).toBeVisible();

    await page.getByRole('button', { name: 'Apple Device Support', exact: true }).click();
    await expect(page).toHaveURL(/track=APPLE/);

    await expect(page.getByRole('heading', { name: 'Fondamentaux Apple MDM' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ingénieur Jamf' })).not.toBeVisible();
  });
});
