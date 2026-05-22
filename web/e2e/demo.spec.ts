import { expect, test } from '@playwright/test';

test.describe('Page démo — smoke', () => {
  test('affiche le parcours guidé, le bandeau compte démo et les liens clés', async ({ page }) => {
    const response = await page.goto('/demo');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: /Tester Apple MDM Academy en 6 étapes/i })).toBeVisible();
    await expect(page.getByRole('note', { name: /Identifiants compte démo/i })).toBeVisible();
    const credentialsBanner = page.getByRole('note', { name: /Identifiants compte démo/i });
    await expect(credentialsBanner.getByText('demo@ama.dev', { exact: true })).toBeVisible();
    await expect(credentialsBanner.getByText(/Technicien démo/i)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Compte démo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Parcours MDM' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quiz et mini-scénarios' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quêtes hebdo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Classement' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Certificat de complétion' })).toBeVisible();

    await expect(page.getByRole('link', { name: /Ouvrir le classement/i })).toHaveAttribute('href', '/leaderboard');
    await expect(page.getByRole('link', { name: /Voir un certificat démo/i })).toHaveAttribute(
      'href',
      '/courses/apple-cert-prep/certificate',
    );
  });
});
