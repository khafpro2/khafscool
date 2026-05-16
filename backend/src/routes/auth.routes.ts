import type { FastifyInstance } from 'fastify';
import * as auth from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import type { OAuthProviderName } from '../config/oauth.js';

export async function authRoutes(app: FastifyInstance) {
  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { redirect?: string } }>(
    '/auth/:provider/start',
    auth.startOAuth
  );
  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { code?: string; state?: string } }>(
    '/auth/:provider/callback',
    auth.oauthCallback
  );
  app.post<{ Body: { email: string; password: string; displayName: string } }>('/auth/register', auth.registerLocal);
  app.post<{ Body: { email: string; password: string } }>('/auth/login', auth.loginLocal);
  app.post<{ Body: { refreshToken: string } }>('/auth/refresh', auth.refreshTokens);
  app.post<{ Body: { refreshToken?: string } }>('/auth/logout', { preHandler: requireAuth }, auth.logout);
  app.get('/auth/me', { preHandler: requireAuth }, auth.getCurrentUser);
}
