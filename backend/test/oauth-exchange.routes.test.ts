import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { authRoutes } from '../src/routes/auth.routes.js';
import { createOAuthSessionCode } from '../src/services/oauth-session.service.js';

describe('POST /auth/oauth/exchange', () => {
  it('returns tokens once for a valid session code', async () => {
    const sessionCode = createOAuthSessionCode({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        displayName: 'Camille',
        provider: 'GOOGLE',
      },
    });

    const app = Fastify();
    await app.register(authRoutes);

    const success = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { sessionCode },
    });

    expect(success.statusCode).toBe(200);
    expect(success.json()).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1', email: 'user@example.com' },
    });

    const replay = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { sessionCode },
    });

    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await app.close();
  });
});
