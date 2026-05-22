import type { FastifyInstance } from 'fastify';
import * as billing from '../controllers/billing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export async function billingRoutes(app: FastifyInstance) {
  app.get('/billing/status', billing.getBillingStatus);
  app.post<{ Body: unknown }>(
    '/billing/checkout',
    { preHandler: requireAuth },
    billing.createCheckout
  );
  app.post('/billing/webhook', billing.stripeWebhook);
  app.post('/donations/webhook', billing.stripeWebhook);
}
