import { expect, test } from '@playwright/test';

test.describe('Quêtes — filtre par piste', () => {
  test('filtre Jamf masque les quêtes Apple en mode démo', async ({ page }) => {
    await page.goto('/quests');
    await expect(page.getByRole('heading', { name: /Renouvelle ton rythme/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.locator('.card:not(.notice-success)').getByRole('heading', { name: /Valide 2 unités Apple/i })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Jamf Pro', exact: true }).click();
    await expect(page).toHaveURL(/track=JAMF/);

    await expect(
      page.locator('.card:not(.notice-success)').getByRole('heading', { name: /Valide 2 unités Jamf Pro/i })
    ).toBeVisible();
    await expect(
      page.locator('.card:not(.notice-success)').getByRole('heading', { name: /Valide 2 unités Apple/i })
    ).not.toBeVisible();
  });
});
