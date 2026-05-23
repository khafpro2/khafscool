import type { FastifyInstance } from 'fastify';
import * as donations from '../controllers/donations.controller.js';
import { requireAdminApiKey } from '../middleware/admin-api-key.middleware.js';
import { optionalAuth } from '../middleware/optional-auth.middleware.js';

export async function donationsRoutes(app: FastifyInstance) {
  app.get('/donations/status', donations.getDonationStatus);
  app.get('/admin/donations/stats', { preHandler: requireAdminApiKey }, donations.getDonationStats);
  app.get('/admin/donations/export.csv', { preHandler: requireAdminApiKey }, donations.exportDonationsCsv);
  app.post<{ Body: unknown }>(
    '/donations/create-checkout-session',
    { preHandler: optionalAuth },
    donations.createDonationCheckout
  );
}
