import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';

/** Stub Stripe — brancher stripe.checkout.sessions.create en prod */
export async function createCheckout(
  req: FastifyRequest<{ Body: { plan: 'monthly' | 'yearly' | 'enterprise' } }>,
  reply: FastifyReply
) {
  const plan = req.body.plan;
  await prisma.subscription.upsert({
    where: { userId: req.user.sub },
    create: { userId: req.user.sub, plan: plan.toUpperCase(), status: 'pending' },
    update: { plan: plan.toUpperCase(), status: 'pending' },
  });

  return reply.send({
    checkoutUrl: `https://checkout.stripe.com/pay/demo-${plan}`,
    message: 'Configurer STRIPE_SECRET_KEY pour activer les paiements réels.',
  });
}

export async function stripeWebhook(req: FastifyRequest, reply: FastifyReply) {
  const event = req.body as { type?: string; data?: { object?: { customer?: string; status?: string } } };
  if (event.type === 'customer.subscription.updated') {
    // Mapper customer → userId via stripeCustomerId
  }
  return reply.send({ received: true });
}
