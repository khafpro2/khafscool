import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { buildFrenchRateLimitBody } from '../lib/rate-limit.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import type { OAuthProviderName } from '../config/oauth.js';

export async function authRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 10,
    timeWindow: '1 minute',
    hook: 'preHandler',
    errorResponseBuilder: buildFrenchRateLimitBody,
  });

  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { redirect?: string } }>(
    '/auth/:provider/start',
    auth.startOAuth
  );
  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { code?: string; state?: string } }>(
    '/auth/:provider/callback',
    auth.oauthCallback
  );
  app.post<{ Body: unknown }>('/auth/register', auth.registerLocal);
  app.post<{ Body: unknown }>('/auth/login', auth.loginLocal);
  app.post<{ Body: unknown }>('/auth/refresh', auth.refreshTokens);
  app.post<{ Body: { refreshToken?: string } }>('/auth/logout', { preHandler: requireAuth }, auth.logout);
  app.post('/auth/logout-all', { preHandler: requireAuth }, auth.logoutAllSessions);
  app.get('/auth/me', { preHandler: requireAuth }, auth.getCurrentUser);
}
