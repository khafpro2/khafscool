import { beforeEach, describe, expect, it, vi } from 'vitest';

const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    donation: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userProgress: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  handleDonationCheckoutCompleted,
  logDonationConfirmation,
} from '../src/services/donations-webhook.service.js';
import { SUPPORTER_BADGE } from '../src/services/supporter-badge.service.js';

describe('donations webhook service', () => {
  beforeEach(() => {
    infoSpy.mockClear();
    vi.mocked(prisma.donation.findUnique).mockReset();
    vi.mocked(prisma.donation.create).mockReset();
    vi.mocked(prisma.userProgress.findUnique).mockReset();
    vi.mocked(prisma.userProgress.create).mockReset();
    vi.mocked(prisma.userProgress.update).mockReset();
  });

  it('records a donation from checkout.session.completed metadata', async () => {
    vi.mocked(prisma.donation.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userProgress.findUnique).mockResolvedValue({
      badges: [],
    } as never);

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
    expect(prisma.userProgress.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { badges: [SUPPORTER_BADGE] },
    });
    expect(infoSpy).toHaveBeenCalledWith(
      '[donation] payment confirmed — email notification stub',
      expect.objectContaining({
        stripeSessionId: 'cs_donation_1',
        amountCents: 1000,
        currency: 'eur',
        email: 'donor@example.com',
        userId: 'user-1',
      })
    );
  });

  it('logs donation confirmation stub without awarding badge when anonymous', async () => {
    vi.mocked(prisma.donation.findUnique).mockResolvedValue(null);

    await handleDonationCheckoutCompleted({
      id: 'cs_donation_anon',
      metadata: { type: 'donation', amountCents: '500' },
      amount_total: 500,
      currency: 'eur',
    } as never);

    expect(prisma.userProgress.findUnique).not.toHaveBeenCalled();
    expect(prisma.userProgress.create).not.toHaveBeenCalled();
    expect(prisma.userProgress.update).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      '[donation] payment confirmed — email notification stub',
      expect.objectContaining({
        stripeSessionId: 'cs_donation_anon',
        userId: null,
      })
    );
  });

  it('logDonationConfirmation writes console.info payload', () => {
    logDonationConfirmation({
      stripeSessionId: 'cs_test',
      amountCents: 500,
      currency: 'eur',
      email: 'a@b.c',
      userId: null,
    });
    expect(infoSpy).toHaveBeenCalledOnce();
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
