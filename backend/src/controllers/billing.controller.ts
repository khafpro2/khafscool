import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const planConfig = {
  monthly: { label: 'MONTHLY', priceId: () => env.stripeMonthlyPriceId },
  yearly: { label: 'YEARLY', priceId: () => env.stripeYearlyPriceId },
  enterprise: { label: 'ENTERPRISE', priceId: () => undefined },
} as const;

async function createStripeCheckoutSession(userId: string, plan: keyof typeof planConfig) {
  const priceId = planConfig[plan].priceId();
  if (!env.stripeSecretKey || !priceId) return null;

  const params = new URLSearchParams({
    mode: 'subscription',
    success_url: `${env.webUrl}/dashboard?checkout=success`,
    cancel_url: `${env.webUrl}/pricing?checkout=cancelled`,
    client_reference_id: userId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[userId]': userId,
    'metadata[plan]': plan,
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`STRIPE_CHECKOUT_FAILED:${response.status}:${detail}`);
  }

  return (await response.json()) as { id: string; url: string | null };
}

export async function createCheckout(
  req: FastifyRequest<{ Body: { plan: 'monthly' | 'yearly' | 'enterprise' } }>,
  reply: FastifyReply
) {
  const plan = req.body.plan;
  if (!planConfig[plan]) return reply.status(400).send({ error: 'INVALID_PLAN' });

  await prisma.subscription.upsert({
    where: { userId: req.user.sub },
    create: { userId: req.user.sub, plan: planConfig[plan].label, status: 'pending' },
    update: { plan: planConfig[plan].label, status: 'pending' },
  });

  const session = await createStripeCheckoutSession(req.user.sub, plan);
  if (session?.url) {
    return reply.send({ checkoutUrl: session.url, checkoutSessionId: session.id, mode: 'stripe' });
  }

  return reply.send({
    checkoutUrl: `${env.webUrl}/pricing?checkout=demo-${plan}`,
    mode: 'demo',
    message: 'Configurer STRIPE_SECRET_KEY pour activer les paiements réels.',
  });
}

export async function stripeWebhook(req: FastifyRequest, reply: FastifyReply) {
  const event = req.body as {
    type?: string;
    data?: {
      object?: {
        client_reference_id?: string;
        metadata?: { userId?: string; plan?: string };
        customer?: string;
        subscription?: string;
        status?: string;
      };
    };
  };
  const object = event.data?.object;
  const userId = object?.metadata?.userId ?? object?.client_reference_id;

  if (userId && event.type === 'checkout.session.completed') {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: object?.metadata?.plan?.toUpperCase() ?? 'MONTHLY',
        status: 'active',
        stripeCustomerId: typeof object?.customer === 'string' ? object.customer : undefined,
        stripeSubscriptionId: typeof object?.subscription === 'string' ? object.subscription : undefined,
      },
      update: {
        status: 'active',
        stripeCustomerId: typeof object?.customer === 'string' ? object.customer : undefined,
        stripeSubscriptionId: typeof object?.subscription === 'string' ? object.subscription : undefined,
      },
    });
  }

  return reply.send({ received: true });
}
