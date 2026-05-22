import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const createDonationCheckoutSession = vi.fn();

vi.mock('../src/lib/stripe.js', () => ({
  isStripeConfigured: vi.fn(() => Boolean(process.env.STRIPE_SECRET_KEY)),
  donationCheckoutReady: vi.fn(() => Boolean(process.env.STRIPE_SECRET_KEY)),
  getDonationFallbackUrl: vi.fn(() => process.env.DONATION_URL?.trim() || null),
  DONATION_PRESET_AMOUNTS_CENTS: [500, 1000, 2000],
  createDonationCheckoutSession: (...args: unknown[]) => createDonationCheckoutSession(...args),
}));

import {
  buildDonationStatusResponse,
  createDonationCheckout,
  parseDonationCheckoutRequest,
} from '../src/controllers/donations.controller.js';
import { prisma } from '../src/lib/prisma.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

function makeReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn((payload: unknown) => payload),
  };

  return reply as unknown as FastifyReply & typeof reply;
}

function makeRequest(body: unknown, userId?: string) {
  return {
    body,
    user: userId ? { sub: userId } : undefined,
    log: { error: vi.fn() },
  } as FastifyRequest<{ Body: unknown }> & { log: { error: ReturnType<typeof vi.fn> } };
}

describe('donations checkout', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    createDonationCheckoutSession.mockReset();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.DONATION_URL;
  });

  it('validates amountCents bounds', () => {
    expect(parseDonationCheckoutRequest({ amountCents: 1000 }).success).toBe(true);
    expect(parseDonationCheckoutRequest({ amountCents: 50 }).success).toBe(false);
    expect(parseDonationCheckoutRequest({ amountCents: 200_000 }).success).toBe(false);
  });

  it('exposes donation status with fallback URL when Stripe is absent', () => {
    process.env.DONATION_URL = 'https://buymeacoffee.com/mdm-academy';

    expect(buildDonationStatusResponse()).toEqual({
      mode: 'fallback',
      stripe: {
        configured: false,
        checkoutEnabled: false,
      },
      fallbackUrl: 'https://buymeacoffee.com/mdm-academy',
      suggestedAmountsCents: [500, 1000, 2000],
      message: 'Paiement externe — la formation reste 100 % gratuite.',
    });
  });

  it('returns fallback checkout URL when Stripe is not configured', async () => {
    process.env.DONATION_URL = 'https://paypal.me/mdm-academy';
    const reply = makeReply();

    await createDonationCheckout(makeRequest({ amountCents: 1000 }), reply);

    expect(reply.send).toHaveBeenCalledWith({
      mode: 'fallback',
      checkoutUrl: 'https://paypal.me/mdm-academy',
      amountCents: 1000,
      message: 'Redirection vers la page de don externe.',
    });
    expect(createDonationCheckoutSession).not.toHaveBeenCalled();
  });

  it('returns 503 when neither Stripe nor fallback URL is configured', async () => {
    const reply = makeReply();

    await createDonationCheckout(makeRequest({ amountCents: 500 }), reply);

    expect(reply.status).toHaveBeenCalledWith(503);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'DONATION_CHECKOUT_UNAVAILABLE',
      }),
    );
  });

  it('creates a live Stripe session when configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: 'donor@example.com' } as never);
    createDonationCheckoutSession.mockResolvedValue({
      id: 'cs_test_donation',
      url: 'https://checkout.stripe.com/c/pay/cs_test_donation',
    });

    const reply = makeReply();
    await createDonationCheckout(makeRequest({ amountCents: 2000 }, 'user-42'), reply);

    expect(createDonationCheckoutSession).toHaveBeenCalledWith({
      amountCents: 2000,
      userId: 'user-42',
      customerEmail: 'donor@example.com',
    });
    expect(reply.send).toHaveBeenCalledWith({
      mode: 'live',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_donation',
      amountCents: 2000,
      sessionId: 'cs_test_donation',
    });
  });
});
