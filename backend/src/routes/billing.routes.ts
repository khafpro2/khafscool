import type { FastifyInstance } from 'fastify';
import * as billing from '../controllers/billing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export async function billingRoutes(app: FastifyInstance) {
  app.post<{ Body: { plan: 'monthly' | 'yearly' | 'enterprise' } }>(
    '/billing/checkout',
    { preHandler: requireAuth },
    billing.createCheckout
  );
  app.post('/billing/webhook', billing.stripeWebhook);
}
