import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DEV_ACCESS = 'dev-access-secret-change-in-production';
const DEV_REFRESH = 'dev-refresh-secret-change-in-production';

describe('getAuthHealth', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'ci-test-jwt-secret-min-32-characters-long';
    process.env.JWT_REFRESH_SECRET = 'ci-test-jwt-refresh-secret-min-32-chars';
    process.env.CORS_ORIGIN = 'https://apple-mdm-academy.vercel.app';
    delete process.env.RAILWAY_ENVIRONMENT;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  async function loadAuthHealth() {
    const mod = await import('../src/lib/auth-health.js');
    return mod.getAuthHealth();
  }

  it('reports ok in development with strong secrets', async () => {
    process.env.NODE_ENV = 'development';
    const health = await loadAuthHealth();
    expect(health.status).toBe('ok');
    expect(health.jwtRoundTripOk).toBe(true);
    expect(health.environment).toBe('development');
  });

  it('reports warning in development with default secrets', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = DEV_ACCESS;
    process.env.JWT_REFRESH_SECRET = DEV_REFRESH;
    const health = await loadAuthHealth();
    expect(health.status).toBe('warning');
    expect(health.jwtAccessConfigured).toBe(false);
  });

  it('reports error in production when secrets are missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.CORS_ORIGIN;
    const health = await loadAuthHealth();
    expect(health.status).toBe('error');
    expect(health.message).toMatch(/JWT_SECRET/);
  });

  it('reports ok in production with strong secrets and CORS', async () => {
    process.env.NODE_ENV = 'production';
    const health = await loadAuthHealth();
    expect(health.status).toBe('ok');
    expect(health.jwtAccessConfigured).toBe(true);
    expect(health.corsConfigured).toBe(true);
  });
});
