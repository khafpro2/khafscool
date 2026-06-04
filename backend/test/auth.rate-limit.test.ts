import { describe, expect, it } from 'vitest';

import { authLoginRateLimit, buildAuthRateLimitBody } from '../src/lib/rate-limit.js';

describe('auth login rate limit', () => {
  it('exposes a French structured 429 body for login and register', () => {
    const body = buildAuthRateLimitBody(null, { after: 60 });
    expect(body).toEqual({
      error: 'RATE_LIMIT_EXCEEDED',
      message: expect.stringContaining('connexion'),
      retryAfter: 60,
    });
  });

  it('limits sensitive auth endpoints to five attempts per minute', () => {
    expect(authLoginRateLimit.max).toBe(5);
    expect(authLoginRateLimit.timeWindow).toBe('1 minute');
  });
});
