import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    donation: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { handleDonationCheckoutCompleted } from '../src/services/donations-webhook.service.js';

describe('donations webhook service', () => {
  beforeEach(() => {
    vi.mocked(prisma.donation.findUnique).mockReset();
    vi.mocked(prisma.donation.create).mockReset();
  });

  it('records a donation from checkout.session.completed metadata', async () => {
    vi.mocked(prisma.donation.findUnique).mockResolvedValue(null);

    await handleDonationCheckoutCompleted({
      id: 'cs_donation_1',
      metadata: { type: 'donation', amountCents: '1000', userId: 'user-1' },
      amount_total: 1000,
      currency: 'eur',
      customer_details: { email: 'donor@example.com' },
    } as never);

    expect(prisma.donation.create).toHaveBeenCalledWith({
      data: {
        amountCents: 1000,
        currency: 'eur',
        email: 'donor@example.com',
        userId: 'user-1',
        stripeSessionId: 'cs_donation_1',
      },
    });
  });

  it('ignores duplicate webhook deliveries', async () => {
    vi.mocked(prisma.donation.findUnique).mockResolvedValue({ id: 'existing' } as never);

    await handleDonationCheckoutCompleted({
      id: 'cs_donation_1',
      metadata: { type: 'donation', amountCents: '500' },
      amount_total: 500,
    } as never);

    expect(prisma.donation.create).not.toHaveBeenCalled();
  });
});
