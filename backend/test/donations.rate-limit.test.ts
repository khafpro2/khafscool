import { describe, expect, it } from 'vitest';

import { buildFrenchRateLimitBody, donationCheckoutRateLimit } from '../src/lib/rate-limit.js';

describe('donation checkout rate limit', () => {
  it('exposes a French structured 429 body for create-checkout-session', () => {
    const body = buildFrenchRateLimitBody(null, { after: 60_000 });
    expect(body).toEqual({
      error: 'RATE_LIMIT_EXCEEDED',
      message: expect.stringContaining('Trop de tentatives'),
      retryAfter: 60_000,
    });
  });

  it('limits donation checkout to 10 requests per minute', () => {
    expect(donationCheckoutRateLimit.max).toBe(10);
    expect(donationCheckoutRateLimit.timeWindow).toBe('1 minute');
  });
});
