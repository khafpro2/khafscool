import type { FastifyReply, FastifyRequest } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    subscription: {
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const createStripeCheckoutSession = vi.fn();

vi.mock('../src/lib/stripe.js', () => ({
  isStripeConfigured: vi.fn(() => Boolean(process.env.STRIPE_SECRET_KEY)),
  stripeCheckoutReady: vi.fn(
    () =>
      Boolean(process.env.STRIPE_SECRET_KEY) &&
      Boolean(process.env.STRIPE_PRICE_ID_MONTHLY) &&
      Boolean(process.env.STRIPE_PRICE_ID_YEARLY) &&
      Boolean(process.env.STRIPE_PRICE_ID_ENTERPRISE)
  ),
  createStripeCheckoutSession: (...args: unknown[]) => createStripeCheckoutSession(...args),
  resetStripeClientForTests: vi.fn(),
}));

import {
  buildBillingStatusResponse,
  createCheckout,
  parseCheckoutRequest,
} from '../src/controllers/billing.controller.js';
import { prisma } from '../src/lib/prisma.js';

function makeReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn((payload: unknown) => payload),
  };

  return reply as unknown as FastifyReply & typeof reply;
}

function makeRequest(body: unknown) {
  return {
    body,
    user: { sub: 'user-1' },
    log: { error: vi.fn() },
  } as FastifyRequest<{ Body: unknown }> & { log: { error: ReturnType<typeof vi.fn> } };
}

describe('billing checkout validation', () => {
  beforeEach(() => {
    vi.mocked(prisma.subscription.upsert).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    createStripeCheckoutSession.mockReset();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ID_MONTHLY;
    delete process.env.STRIPE_PRICE_ID_YEARLY;
    delete process.env.STRIPE_PRICE_ID_ENTERPRISE;
  });

  it('accepts supported plans', () => {
    expect(parseCheckoutRequest({ plan: 'monthly' }).success).toBe(true);
    expect(parseCheckoutRequest({ plan: 'yearly' }).success).toBe(true);
    expect(parseCheckoutRequest({ plan: 'enterprise' }).success).toBe(true);
  });

  it('rejects unsupported plans before writing a subscription', async () => {
    const reply = makeReply();

    await createCheckout(makeRequest({ plan: 'weekly' }), reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'INVALID_BILLING_CHECKOUT_REQUEST',
      }),
    );
    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
  });

  it('returns a structured demo checkout when Stripe is not configured', async () => {
    vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as never);
    const reply = makeReply();

    await createCheckout(makeRequest({ plan: 'yearly' }), reply);

    expect(prisma.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: { userId: 'user-1', plan: 'YEARLY', status: 'pending' },
      update: { plan: 'YEARLY', status: 'pending' },
    });
    expect(reply.send).toHaveBeenCalledWith({
      demo: true,
      mode: 'demo',
      provider: 'stripe',
      plan: 'yearly',
      checkoutUrl: 'https://checkout.stripe.com/pay/demo-yearly',
      stripe: {
        configured: false,
        checkoutEnabled: false,
      },
      message: 'Configurer STRIPE_SECRET_KEY pour activer les paiements réels.',
    });
    expect(createStripeCheckoutSession).not.toHaveBeenCalled();
  });

  it('creates a live Stripe session when Stripe is fully configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_PRICE_ID_MONTHLY = 'price_monthly';
    process.env.STRIPE_PRICE_ID_YEARLY = 'price_yearly';
    process.env.STRIPE_PRICE_ID_ENTERPRISE = 'price_enterprise';

    vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: 'learner@example.com' } as never);
    createStripeCheckoutSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const reply = makeReply();
    await createCheckout(makeRequest({ plan: 'monthly' }), reply);

    expect(createStripeCheckoutSession).toHaveBeenCalledWith({
      plan: 'monthly',
      userId: 'user-1',
      customerEmail: 'learner@example.com',
    });
    expect(reply.send).toHaveBeenCalledWith({
      demo: false,
      mode: 'live',
      provider: 'stripe',
      plan: 'monthly',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_123',
      stripe: {
        configured: true,
        checkoutEnabled: true,
      },
      sessionId: 'cs_test_123',
    });
  });

  it('exposes billing status for the pricing page badge', () => {
    expect(buildBillingStatusResponse()).toEqual({
      mode: 'demo',
      demo: true,
      stripe: {
        configured: false,
        checkoutEnabled: false,
      },
    });

    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_PRICE_ID_MONTHLY = 'price_monthly';
    process.env.STRIPE_PRICE_ID_YEARLY = 'price_yearly';
    process.env.STRIPE_PRICE_ID_ENTERPRISE = 'price_enterprise';

    expect(buildBillingStatusResponse()).toEqual({
      mode: 'live',
      demo: false,
      stripe: {
        configured: true,
        checkoutEnabled: true,
      },
    });
  });
});
