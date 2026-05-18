import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const checkoutRequestSchema = z.object({
  plan: z.enum(['monthly', 'yearly', 'enterprise'], {
    required_error: 'plan is required',
    invalid_type_error: 'plan must be monthly, yearly or enterprise',
  }),
});

export type CheckoutPlan = z.infer<typeof checkoutRequestSchema>['plan'];

export function parseCheckoutRequest(body: unknown) {
  return checkoutRequestSchema.safeParse(body ?? {});
}

function buildDemoCheckoutResponse(plan: CheckoutPlan) {
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return {
    mode: 'demo',
    provider: 'stripe',
    plan,
    checkoutUrl: `https://checkout.stripe.com/pay/demo-${plan}`,
    stripe: {
      configured: stripeConfigured,
      checkoutEnabled: false,
    },
    message: stripeConfigured
      ? 'Stripe est configuré, mais le package stripe n’est pas installé côté backend.'
      : 'Configurer STRIPE_SECRET_KEY pour activer les paiements réels.',
  };
}

export async function createCheckout(
  req: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const parsedBody = parseCheckoutRequest(req.body);
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_BILLING_CHECKOUT_REQUEST',
      details: parsedBody.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
  }

  const { plan } = parsedBody.data;

  await prisma.subscription.upsert({
    where: { userId: req.user.sub },
    create: { userId: req.user.sub, plan: plan.toUpperCase(), status: 'pending' },
    update: { plan: plan.toUpperCase(), status: 'pending' },
  });

  return reply.send(buildDemoCheckoutResponse(plan));
}

export async function stripeWebhook(req: FastifyRequest, reply: FastifyReply) {
  const event = req.body as { type?: string; data?: { object?: { customer?: string; status?: string } } };
  if (event.type === 'customer.subscription.updated') {
    // Mapper customer → userId via stripeCustomerId
  }
  return reply.send({ received: true });
}
