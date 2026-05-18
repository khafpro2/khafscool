import type { FastifyReply, FastifyRequest } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    subscription: {
      upsert: vi.fn(),
    },
  },
}));

import { createCheckout, parseCheckoutRequest } from '../src/controllers/billing.controller.js';
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
  } as FastifyRequest<{ Body: unknown }>;
}

describe('billing checkout validation', () => {
  beforeEach(() => {
    vi.mocked(prisma.subscription.upsert).mockReset();
    delete process.env.STRIPE_SECRET_KEY;
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
  });
});
