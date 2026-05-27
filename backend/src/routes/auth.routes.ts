import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import * as auth from '../controllers/auth.controller.js';
import {
  authLoginRateLimit,
  buildAuthRateLimitBody,
} from '../lib/rate-limit.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import type { OAuthProviderName } from '../config/oauth.js';

const authSensitiveRateLimitRouteConfig = {
  rateLimit: authLoginRateLimit,
};

export async function authRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    global: false,
    hook: 'preHandler',
    errorResponseBuilder: buildAuthRateLimitBody,
  });

  app.get('/auth/oauth/status', auth.getOAuthStatus);
  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { redirect?: string } }>(
    '/auth/:provider/start',
    auth.startOAuth
  );
  app.get<{ Params: { provider: OAuthProviderName }; Querystring: { code?: string; state?: string } }>(
    '/auth/:provider/callback',
    auth.oauthCallback
  );
  app.post<{ Body: unknown }>(
    '/auth/oauth/exchange',
    { config: authSensitiveRateLimitRouteConfig },
    auth.exchangeOAuthSession
  );
  app.post<{ Body: unknown }>(
    '/auth/register',
    { config: authSensitiveRateLimitRouteConfig },
    auth.registerLocal
  );
  app.post<{ Body: unknown }>(
    '/auth/login',
    { config: authSensitiveRateLimitRouteConfig },
    auth.loginLocal
  );
  app.post<{ Body: unknown }>(
    '/auth/refresh',
    { config: authSensitiveRateLimitRouteConfig },
    auth.refreshTokens
  );
  app.post<{ Body: { refreshToken?: string } }>(
    '/auth/logout',
    { preHandler: requireAuth },
    auth.logout
  );
  app.post('/auth/logout-all', { preHandler: requireAuth }, auth.logoutAllSessions);
  app.get('/auth/me', { preHandler: requireAuth }, auth.getCurrentUser);
}
