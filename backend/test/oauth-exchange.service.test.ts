import { afterEach, describe, expect, it, vi } from 'vitest';

describe('oauth exchange guardrails', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('allows dev stub exchange in development when provider is stub', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    const { exchangeCodeAndGetProfile } = await import('../src/services/oauth.service.js');
    const { oauthProviders } = await import('../src/config/oauth.js');

    const profile = await exchangeCodeAndGetProfile('google', 'dev-code', oauthProviders.google);

    expect(profile.email).toMatch(/@oauth\.dev$/);
    expect(profile.sub).toMatch(/^google_/);
  });

  it('rejects stub exchange outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    const { exchangeCodeAndGetProfile } = await import('../src/services/oauth.service.js');
    const { oauthProviders } = await import('../src/config/oauth.js');

    await expect(exchangeCodeAndGetProfile('google', 'dev-code', oauthProviders.google)).rejects.toThrow(
      'OAUTH_UNAVAILABLE'
    );
  });

  it('exchanges Google authorization codes when provider is configured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'google-access-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sub: 'google-sub-123', email: 'user@example.com', name: 'Camille' }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { exchangeCodeAndGetProfile } = await import('../src/services/oauth.service.js');
    const { oauthProviders } = await import('../src/config/oauth.js');

    const profile = await exchangeCodeAndGetProfile(
      'google',
      'real-code',
      oauthProviders.google,
      'pkce-verifier'
    );

    expect(profile).toEqual({
      sub: 'google-sub-123',
      email: 'user@example.com',
      name: 'Camille',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
