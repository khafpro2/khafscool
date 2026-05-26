import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import * as donations from '../controllers/donations.controller.js';
import { buildFrenchRateLimitBody, donationCheckoutRateLimit } from '../lib/rate-limit.js';
import { requireAdminApiKey } from '../middleware/admin-api-key.middleware.js';
import { optionalAuth } from '../middleware/optional-auth.middleware.js';

const donationCheckoutRateLimitRouteConfig = {
  rateLimit: donationCheckoutRateLimit,
};

export async function donationsRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    global: false,
    hook: 'preHandler',
    errorResponseBuilder: buildFrenchRateLimitBody,
  });

  app.get('/donations/status', donations.getDonationStatus);
  app.get('/admin/donations/stats', { preHandler: requireAdminApiKey }, donations.getDonationStats);
  app.get('/admin/donations/export.csv', { preHandler: requireAdminApiKey }, donations.exportDonationsCsv);
  app.post<{ Body: unknown }>(
    '/donations/create-checkout-session',
    { preHandler: optionalAuth, config: donationCheckoutRateLimitRouteConfig },
    donations.createDonationCheckout
  );
}
