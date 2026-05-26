import { expect, test } from '@playwright/test';
import { loginDemoUser } from './helpers/auth-mocks';
import { PROXY_COURSE_PROGRESS, PROXY_PRACTICE_EXAM } from './helpers/proxy-routes';

const mockPracticeExam = {
  course: { slug: 'apple-cert-prep', title: 'Parcours Apple', track: 'APPLE' },
  poolSize: 44,
  questionCount: 10,
  attemptToken: 'e2e-attempt-token',
  questions: Array.from({ length: 10 }, (_, index) => ({
    id: `q-${index + 1}`,
    moduleId: `module-${(index % 4) + 1}`,
    type: 'MULTIPLE_CHOICE',
    prompt: `Question E2E ${index + 1} ?`,
    options: [
      { id: 'a', label: 'Réponse A' },
      { id: 'b', label: 'Réponse B' },
    ],
  })),
};

test.describe('Examen blanc parcours — compte connecté (mock API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(PROXY_COURSE_PROGRESS, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          course: mockPracticeExam.course,
          progress: { progressPercent: 100, completedModules: 4, totalModules: 4 },
          modules: [],
        }),
      });
    });

    await page.route(PROXY_PRACTICE_EXAM, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPracticeExam),
      });
    });
  });

  test('débloque l’examen après connexion démo', async ({ page }) => {
    await loginDemoUser(page, '/courses/apple-cert-prep/examen');

    await expect(page).toHaveURL(/\/courses\/apple-cert-prep\/examen/);
    await expect(page.getByText(/Question 1 sur 10/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Mode démo/i)).toHaveCount(0);
    await expect(page.getByText(/Pool de 44 questions/i)).toBeVisible();
  });
});
