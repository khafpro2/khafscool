import { describe, expect, it } from 'vitest';

import { loginSchema, refreshSchema, registerSchema } from '../src/schemas/auth.schemas.js';

describe('auth schemas', () => {
  it('rejects invalid register payloads with French messages', () => {
    const result = registerSchema.safeParse({
      email: 'invalid',
      password: 'short',
      displayName: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('e-mail'))).toBe(true);
      expect(result.error.issues.some((issue) => issue.message.includes('8 caractères'))).toBe(true);
    }
  });

  it('accepts valid login payloads', () => {
    expect(
      loginSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
      }).success
    ).toBe(true);
  });

  it('requires refresh token', () => {
    expect(refreshSchema.safeParse({}).success).toBe(false);
  });
});
