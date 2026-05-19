import type { FastifyReply, FastifyRequest } from 'fastify';
import type Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  createStripeCheckoutSession,
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
  stripeCheckoutReady,
  stripeWebhookReady,
} from '../lib/stripe.js';
import { processStripeWebhookEvent } from '../services/billing-webhook.service.js';

export type BillingWebhookRequest = FastifyRequest & { rawBody?: Buffer };

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

export function buildDemoCheckoutResponse(plan: CheckoutPlan) {
  const stripeConfigured = isStripeConfigured();

  return {
    demo: true,
    mode: 'demo' as const,
    provider: 'stripe',
    plan,
    checkoutUrl: `https://checkout.stripe.com/pay/demo-${plan}`,
    stripe: {
      configured: stripeConfigured,
      checkoutEnabled: false,
    },
    message: stripeConfigured
      ? 'Stripe est configuré mais les identifiants de prix (STRIPE_PRICE_ID_*) manquent ou le checkout live est indisponible.'
      : 'Configurer STRIPE_SECRET_KEY pour activer les paiements réels.',
  };
}

export function buildBillingStatusResponse() {
  const configured = isStripeConfigured();
  const checkoutEnabled = stripeCheckoutReady();

  return {
    mode: checkoutEnabled ? ('live' as const) : ('demo' as const),
    demo: !checkoutEnabled,
    stripe: {
      configured,
      checkoutEnabled,
    },
  };
}

export async function getBillingStatus(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(buildBillingStatusResponse());
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

  if (!stripeCheckoutReady()) {
    return reply.send(buildDemoCheckoutResponse(plan));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { email: true },
    });
    const session = await createStripeCheckoutSession({
      plan,
      userId: req.user.sub,
      customerEmail: user?.email,
    });

    if (!session.url) {
      return reply.status(502).send({
        error: 'STRIPE_CHECKOUT_URL_MISSING',
        message: 'Stripe a répondu sans URL de redirection.',
      });
    }

    return reply.send({
      demo: false,
      mode: 'live' as const,
      provider: 'stripe',
      plan,
      checkoutUrl: session.url,
      stripe: {
        configured: true,
        checkoutEnabled: true,
      },
      sessionId: session.id,
    });
  } catch (error) {
    req.log.error({ err: error }, 'stripe checkout session failed');
    return reply.status(502).send({
      error: 'STRIPE_CHECKOUT_FAILED',
      message: 'Impossible de créer la session Stripe. Réessaie plus tard.',
    });
  }
}

export async function stripeWebhook(req: BillingWebhookRequest, reply: FastifyReply) {
  if (!stripeWebhookReady()) {
    return reply.status(503).send({
      error: 'STRIPE_WEBHOOK_NOT_CONFIGURED',
      message: 'Configurer STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET.',
    });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    return reply.status(400).send({ error: 'MISSING_STRIPE_SIGNATURE' });
  }

  const rawBody = req.rawBody;
  if (!rawBody?.length) {
    return reply.status(400).send({ error: 'MISSING_RAW_BODY' });
  }

  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return reply.status(503).send({ error: 'STRIPE_WEBHOOK_NOT_CONFIGURED' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    req.log.warn({ err: error }, 'stripe webhook signature invalid');
    return reply.status(400).send({ error: 'INVALID_STRIPE_SIGNATURE' });
  }

  try {
    await processStripeWebhookEvent(event);
    return reply.send({ received: true, type: event.type });
  } catch (error) {
    req.log.error({ err: error, eventType: event.type }, 'stripe webhook handler failed');
    return reply.status(500).send({ error: 'WEBHOOK_HANDLER_FAILED' });
  }
}
