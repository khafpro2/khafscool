import { expect, test } from '@playwright/test';

test.describe('Parcours — deep link module actif', () => {
  test('scroll et surbrillance via hash #module-{slug}', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    const moduleCard = page.locator('#module-device-support-basics');
    await expect(moduleCard).toBeVisible({ timeout: 15_000 });
    await expect(moduleCard).toHaveClass(/course-module-hash-highlight/);
  });
});
