import type { FastifyInstance } from 'fastify';
import * as donations from '../controllers/donations.controller.js';
import { optionalAuth } from '../middleware/optional-auth.middleware.js';

export async function donationsRoutes(app: FastifyInstance) {
  app.get('/donations/status', donations.getDonationStatus);
  app.post<{ Body: unknown }>(
    '/donations/create-checkout-session',
    { preHandler: optionalAuth },
    donations.createDonationCheckout
  );
}
