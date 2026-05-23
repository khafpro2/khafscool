import { expect, test } from '@playwright/test';

test.describe('Parcours — deep link module actif', () => {
  test('scroll et surbrillance via hash #module-{slug}', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    const moduleCard = page.locator('#course-active-module');
    await expect(moduleCard).toBeVisible({ timeout: 15_000 });
    await expect(moduleCard).toHaveClass(/course-module-hash-highlight/);
    await expect(page.locator('#module-device-support-basics')).toHaveAttribute('aria-current', 'step');
  });
});
