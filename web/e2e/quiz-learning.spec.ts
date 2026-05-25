import { expect, test } from '@playwright/test';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Quiz — mode apprentissage', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
  });

  test('affiche le bandeau conseils et le badge type de question', async ({ page }) => {
    await page.goto('/courses/apple-cert-prep#module-device-support-basics');
    const quiz = page.locator('.quiz-panel').first();
    await expect(quiz).toBeVisible({ timeout: 15_000 });
    await expect(quiz.getByText(/Comment tirer le meilleur de ce quiz/i)).toBeVisible();
    await expect(quiz.getByText(/Scénario|Triage|Savoir|Quiz/i).first()).toBeVisible();
    await quiz.getByRole('button', { name: 'Compris' }).click();
    await expect(quiz.getByText(/Comment tirer le meilleur de ce quiz/i)).toHaveCount(0);
  });
});
