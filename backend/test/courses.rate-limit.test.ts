import { describe, expect, it } from 'vitest';

import { buildFrenchRateLimitBody, quizProgressRateLimit } from '../src/lib/rate-limit.js';

describe('quiz progress rate limit', () => {
  it('exposes a French structured 429 body for check-answer and complete', () => {
    const body = buildFrenchRateLimitBody(null, { after: 60_000 });
    expect(body).toEqual({
      error: 'RATE_LIMIT_EXCEEDED',
      message: expect.stringContaining('Trop de tentatives'),
      retryAfter: 60_000,
    });
  });

  it('configures a per-minute quota on quiz endpoints', () => {
    expect(quizProgressRateLimit.max).toBeGreaterThan(0);
    expect(quizProgressRateLimit.timeWindow).toBe('1 minute');
  });
});
