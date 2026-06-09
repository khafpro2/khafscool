import { expect, test } from '@playwright/test';

test.describe('Navigation — desktop et mobile', () => {

  test.describe('Desktop (≥ 900px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('nav principale visible sur /courses', async ({ page }) => {
      await page.goto('/courses');
      const nav = page.getByRole('navigation', { name: 'Navigation principale' });
      await expect(nav).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Parcours' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Quêtes' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Classement' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Badges' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Sprint' })).toBeVisible();
    });

    test('logo retourne à l\'accueil', async ({ page }) => {
      await page.goto('/courses');
      await page.getByRole('link', { name: /Retour à l'accueil MDM Academy/i }).click();
      await expect(page).toHaveURL('/');
    });

    test('lien Parcours actif sur /courses (aria-current)', async ({ page }) => {
      await page.goto('/courses');
      const link = page.getByRole('navigation', { name: 'Navigation principale' })
        .getByRole('link', { name: 'Parcours' });
      await expect(link).toHaveAttribute('aria-current', 'page');
    });

    test('hamburger caché sur desktop', async ({ page }) => {
      await page.goto('/courses');
      await expect(page.locator('.site-mobile-nav')).not.toBeVisible();
    });
  });

  test.describe('Mobile (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('hamburger visible sur mobile', async ({ page }) => {
      await page.goto('/courses');
      await expect(page.locator('.site-mobile-nav')).toBeVisible();
    });

    test('nav desktop cachée sur mobile', async ({ page }) => {
      await page.goto('/courses');
      await expect(page.locator('.site-nav')).not.toBeVisible();
    });

    test('ouvre et ferme le menu mobile', async ({ page }) => {
      await page.goto('/courses');
      const toggle = page.getByRole('button', { name: /Ouvrir le menu/i });
      await expect(toggle).toBeVisible();
      await toggle.click();

      const drawer = page.locator('.site-nav-drawer');
      await expect(drawer).toHaveClass(/site-nav-drawer-open/);
      await expect(page.getByRole('link', { name: 'Tous les parcours →' })).toBeVisible();

      await page.getByRole('button', { name: /Fermer le menu/i }).click();
      await expect(drawer).not.toHaveClass(/site-nav-drawer-open/);
    });

    test('Escape ferme le menu mobile', async ({ page }) => {
      await page.goto('/courses');
      await page.getByRole('button', { name: /Ouvrir le menu/i }).click();
      await expect(page.locator('.site-nav-drawer')).toHaveClass(/site-nav-drawer-open/);
      await page.keyboard.press('Escape');
      await expect(page.locator('.site-nav-drawer')).not.toHaveClass(/site-nav-drawer-open/);
    });

    test('navigation mobile vers /quests', async ({ page }) => {
      await page.goto('/courses');
      await page.getByRole('button', { name: /Ouvrir le menu/i }).click();
      await page.getByRole('link', { name: 'Quêtes' }).click();
      await expect(page).toHaveURL('/quests');
    });
  });

  test.describe('Header / Footer', () => {
    test('header absent sur /', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.site-header')).toHaveCount(0);
      await expect(page.locator('.site-footer')).toHaveCount(0);
    });

    test('footer visible sur /courses avec bons liens', async ({ page }) => {
      await page.goto('/courses');
      const footer = page.locator('.site-footer');
      await expect(footer).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Tableau de bord' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Parcours' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Confidentialité' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Conditions' })).toBeVisible();
    });

    test('skip-link visible au focus', async ({ page }) => {
      await page.goto('/courses');
      const skipLink = page.getByRole('link', { name: /Aller au contenu/i });
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    });
  });

  test.describe('Redirects', () => {
    for (const { from, to } of [
      { from: '/cours', to: '/courses' },
      { from: '/parcours', to: '/courses' },
      { from: '/auth/login', to: '/auth' },
      { from: '/auth/signup', to: '/auth' },
      { from: '/privacy', to: '/legal/confidentialite' },
      { from: '/terms', to: '/legal/conditions' },
    ]) {
      test(`${from} redirige vers ${to}`, async ({ page }) => {
        await page.goto(from);
        await expect(page).toHaveURL(new RegExp(to.replace('/', '\\/')));
      });
    }
  });

});
