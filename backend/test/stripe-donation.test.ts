import { beforeEach, describe, expect, it, vi } from 'vitest';

const sessionsCreate = vi.hoisted(() => vi.fn());

vi.mock('stripe', () => {
  function StripeMock() {
    return {
      checkout: {
        sessions: {
          create: sessionsCreate,
        },
      },
    };
  }
  return { default: StripeMock };
});

import { createDonationCheckoutSession, resetStripeClientForTests } from '../src/lib/stripe.js';

describe('donation checkout session URLs', () => {
  beforeEach(() => {
    resetStripeClientForTests();
    sessionsCreate.mockReset();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.WEB_URL = 'https://app.example.com';
    sessionsCreate.mockResolvedValue({ id: 'cs_test', url: 'https://checkout.stripe.com/pay/cs_test' });
  });

  it('redirects success and cancel to dedicated French pages', async () => {
    await createDonationCheckoutSession({
      amountCents: 1000,
      userId: 'user-42',
      customerEmail: 'donor@example.com',
    });

    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: 'https://app.example.com/soutenir/merci?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://app.example.com/soutenir/annule',
        metadata: expect.objectContaining({
          type: 'donation',
          userId: 'user-42',
        }),
      }),
    );
  });
});
