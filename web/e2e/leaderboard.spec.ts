import { expect, test } from '@playwright/test';

test.describe('Classement — filtre par piste', () => {
  test('filtre Jamf masque les entrées Apple et Intune en mode démo', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /Classement des apprenants/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByRole('list').getByText('Yanis — Jamf Lead')).toBeVisible();
    await expect(page.getByRole('list').getByText('Camille — Apple Pro')).toBeVisible();

    await page.getByRole('button', { name: 'Jamf Pro', exact: true }).click();
    await expect(page).toHaveURL(/track=JAMF/);

    await expect(page.getByRole('list').getByText('Yanis — Jamf Lead')).toBeVisible();
    await expect(page.getByRole('list').getByText('Camille — Apple Pro')).not.toBeVisible();
    await expect(page.getByRole('list').getByText('Léa — Intune Specialist')).not.toBeVisible();
  });
});
