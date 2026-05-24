import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { expect, test } from '@playwright/test';

test.describe('Profil — export RGPD integration (API live)', () => {
  test.skip(!process.env.E2E_LIVE_API, 'Set E2E_LIVE_API=1 with API + Postgres seedés');

  test('exporte les données du compte démo en JSON', async ({ page }) => {
    await page.goto('/auth?redirect=/profile');
    await page.getByLabel(/Email/i).fill(DEMO_ACCOUNT.email);
    await page.getByLabel(/Mot de passe/i).fill(DEMO_ACCOUNT.password);
    await page.getByRole('button', { name: /Se connecter/i }).first().click();

    await expect(page).toHaveURL(/\/profile/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Export et suppression \(RGPD\)/i })).toBeVisible({
      timeout: 15_000,
    });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Exporter mes données \(JSON\)/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^mdm-academy-export-/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.from(chunk));
    }
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
      profile?: { email?: string };
      progress?: { points?: number };
    };

    expect(parsed.profile?.email).toBe(DEMO_ACCOUNT.email);
    expect(typeof parsed.progress?.points).toBe('number');
  });
});
