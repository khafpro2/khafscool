import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('OAuth provider status', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.APPLE_CLIENT_ID;
    delete process.env.APPLE_TEAM_ID;
    delete process.env.APPLE_KEY_ID;
    delete process.env.APPLE_PRIVATE_KEY;
    delete process.env.MICROSOFT_CLIENT_ID;
    delete process.env.MICROSOFT_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_DISABLED;
    delete process.env.APPLE_OAUTH_DISABLED;
    delete process.env.MICROSOFT_OAUTH_DISABLED;
    delete process.env.OAUTH_DISABLED;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns stub when credentials are absent', async () => {
    const { getOAuthStatusSnapshot } = await import('../src/config/oauth.js');
    expect(getOAuthStatusSnapshot()).toMatchObject({
      apple: 'stub',
      google: 'stub',
      microsoft: 'stub',
      environment: 'development',
    });
  });

  it('returns configured when client id and secret are set', async () => {
    process.env.GOOGLE_CLIENT_ID = 'google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
    const { getOAuthProviderStatus } = await import('../src/config/oauth.js');
    expect(getOAuthProviderStatus('google')).toBe('configured');
  });

  it('returns configured for Apple when Sign in with Apple keys are present', async () => {
    process.env.APPLE_CLIENT_ID = 'apple-id';
    process.env.APPLE_TEAM_ID = 'TEAM123';
    process.env.APPLE_KEY_ID = 'KEY123';
    process.env.APPLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----';
    const { getOAuthProviderStatus } = await import('../src/config/oauth.js');
    expect(getOAuthProviderStatus('apple')).toBe('configured');
  });

  it('returns disabled when provider flag is set', async () => {
    process.env.GOOGLE_OAUTH_DISABLED = 'true';
    const { getOAuthProviderStatus } = await import('../src/config/oauth.js');
    expect(getOAuthProviderStatus('google')).toBe('disabled');
  });

  it('exposes GET /auth/oauth/status publicly', async () => {
    const { authRoutes } = await import('../src/routes/auth.routes.js');
    const app = Fastify();
    await app.register(authRoutes);
    const response = await app.inject({ method: 'GET', url: '/auth/oauth/status' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      apple: 'stub',
      google: 'stub',
      microsoft: 'stub',
      environment: 'development',
    });

    await app.close();
  });
});
