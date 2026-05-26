import { describe, expect, it } from 'vitest';
import {
  consumeOAuthPkceState,
  signOAuthPkceState,
} from '../src/services/oauth-session.service.js';

describe('oauth pkce state tokens', () => {
  it('signs and verifies PKCE state for multi-instance OAuth', () => {
    const state = signOAuthPkceState({
      verifier: 'verifier-123',
      redirect: 'mdmacademy://oauth',
    });

    expect(consumeOAuthPkceState(state)).toEqual({
      verifier: 'verifier-123',
      redirect: 'mdmacademy://oauth',
    });
  });

  it('rejects tampered state', () => {
    expect(consumeOAuthPkceState('not-a-jwt')).toBeUndefined();
  });
});
