import { expect, test } from '@playwright/test';
import { moduleQuizQuestions, QUESTIONS_BY_COURSE } from '@ama/shared/quiz-content';
import { shuffleQuizQuestionOptions } from '@ama/shared/quiz-learning';
import { seedCookieConsent } from './helpers/cookie-consent';

test.describe('Quiz — mélange des options', () => {
  test.beforeEach(async ({ page }) => {
    await seedCookieConsent(page);
    await page.addInitScript(() => {
      sessionStorage.removeItem('ama-quiz-learning-tip');
    });
  });

  test('affiche les options dans l’ordre mélangé (déterministe par question)', async ({ page }) => {
    const moduleQuestions = moduleQuizQuestions(
      QUESTIONS_BY_COURSE['apple-cert-prep']['apps-vpp-management']
    );
    const firstQuestion = moduleQuestions[0];
    expect(firstQuestion).toBeDefined();

    const shuffled = shuffleQuizQuestionOptions(firstQuestion!.options, firstQuestion!.id);
    const defaultOrder = firstQuestion!.options.map((option) => option.id);
    expect(shuffled.map((option) => option.id)).not.toEqual(defaultOrder);

    await page.goto('/courses/apple-cert-prep#module-apps-vpp-management');
    const quiz = page.locator('.quiz-panel').first();
    await expect(quiz).toBeVisible({ timeout: 15_000 });

    const labels = await quiz.locator('.quiz-option-label').allTextContents();
    expect(labels.length).toBeGreaterThanOrEqual(4);
    expect(labels.slice(0, 4)).toEqual(shuffled.slice(0, 4).map((option) => option.label));
  });
});
