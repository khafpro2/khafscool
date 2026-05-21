import { expect, test } from '@playwright/test';

test.describe('Parcours — deep link module actif', () => {
  test('scroll et surbrillance via hash #module-{slug}', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    await expect(page.getByRole('heading', { name: /Apple Device Support/i })).toBeVisible({
      timeout: 15_000,
    });

    const highlighted = page.locator('#module-device-support-basics.course-module-hash-highlight');
    await expect(highlighted).toBeVisible({ timeout: 10_000 });
  });
});
