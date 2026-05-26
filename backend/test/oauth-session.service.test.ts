import { describe, expect, it } from 'vitest';
import {
  consumeOAuthSessionCode,
  createOAuthSessionCode,
  type OAuthSessionPayload,
} from '../src/services/oauth-session.service.js';

const samplePayload: OAuthSessionPayload = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'Camille',
    provider: 'GOOGLE',
  },
};

describe('oauth session codes', () => {
  it('creates a signed session code and verifies it', () => {
    const code = createOAuthSessionCode(samplePayload);
    expect(code.length).toBeGreaterThan(20);
    expect(consumeOAuthSessionCode(code)).toEqual(samplePayload);
  });

  it('allows replay within JWT TTL (stateless multi-instance)', () => {
    const code = createOAuthSessionCode(samplePayload);
    expect(consumeOAuthSessionCode(code)).toEqual(samplePayload);
    expect(consumeOAuthSessionCode(code)).toEqual(samplePayload);
  });

  it('rejects unknown session codes', () => {
    expect(() => consumeOAuthSessionCode('missing-code')).toThrow('OAUTH_SESSION_CODE_INVALID');
  });
});
