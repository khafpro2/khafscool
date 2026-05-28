import { expect, test } from '@playwright/test';

test.describe('Accueil — écran de bienvenue', () => {
  test('affiche Hello animé, tagline et pistes MDM', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByTestId('home-track-dock')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Choix de piste MDM' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Jamf/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Intune/i })).toBeVisible();
    await expect(page.getByTestId('hero-macbook-poster')).toHaveCount(0);
  });

  test('dock présent avec prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.getByTestId('home-track-dock')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Jamf/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Intune/i })).toBeVisible();
  });

  test('navigation clavier entre les 3 pistes', async ({ page }) => {
    await page.goto('/');

    const apple = page.getByRole('link', { name: /Parcours Apple/i });
    const jamf = page.getByRole('link', { name: /Parcours Jamf/i });
    const intune = page.getByRole('link', { name: /Parcours Intune/i });

    await apple.focus();
    await expect(apple).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(jamf).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(intune).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(jamf).toBeFocused();

    await page.keyboard.press('Home');
    await expect(apple).toBeFocused();

    await page.keyboard.press('End');
    await expect(intune).toBeFocused();
  });

  test('Hello et pistes visibles sur mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expect(page.getByText('Je veux apprendre')).toBeVisible();
    await expect(page.getByTestId('home-track-dock')).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Apple/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Jamf/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Parcours Intune/i })).toBeVisible();
  });
});
