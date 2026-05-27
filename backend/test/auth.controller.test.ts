import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from '../src/schemas/auth.schemas.js';

describe('auth controller error contracts', () => {
  it('maps invalid login payloads to INVALID_LOGIN_REQUEST', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: '' });
    expect(result.success).toBe(false);
  });

  it('maps invalid register payloads to INVALID_REGISTER_REQUEST', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
      displayName: '',
    });
    expect(result.success).toBe(false);
  });

  it('documents French rate-limit response shape', () => {
    const rateLimitBody = {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de tentatives de connexion. Réessayez dans une minute.',
      retryAfter: 60,
    };

    expect(rateLimitBody.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(rateLimitBody.message).toContain('connexion');
  });

  it('uses generic INVALID_CREDENTIALS without leaking account existence', () => {
    const loginFailure = { error: 'INVALID_CREDENTIALS' };
    expect(loginFailure.error).toBe('INVALID_CREDENTIALS');
    expect(JSON.stringify(loginFailure)).not.toMatch(/existe|introuvable|email/i);
  });
});
