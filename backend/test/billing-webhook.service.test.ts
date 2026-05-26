import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    subscription: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  mapStripeSubscriptionStatus,
  planFromCheckoutMetadata,
  processStripeWebhookEvent,
} from '../src/services/billing-webhook.service.js';

describe('billing webhook service', () => {
  beforeEach(() => {
    vi.mocked(prisma.subscription.upsert).mockReset();
    vi.mocked(prisma.subscription.findFirst).mockReset();
    vi.mocked(prisma.subscription.update).mockReset();
  });

  it('maps checkout metadata to subscription rows', async () => {
    await handleCheckoutSessionCompleted({
      mode: 'subscription',
      metadata: { userId: 'user-1', plan: 'yearly' },
      customer: 'cus_123',
      subscription: 'sub_456',
    } as never);

    expect(prisma.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: {
        userId: 'user-1',
        plan: 'YEARLY',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_456',
      },
      update: {
        plan: 'YEARLY',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_456',
      },
    });
  });

  it('ignores checkout sessions without user metadata', async () => {
    await handleCheckoutSessionCompleted({ metadata: {} } as never);
    expect(prisma.subscription.upsert).not.toHaveBeenCalled();
  });

  it('updates subscription status from Stripe lifecycle events', async () => {
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
      userId: 'user-1',
      currentPeriodEnd: null,
    } as never);

    await handleSubscriptionUpdated({
      id: 'sub_456',
      customer: 'cus_123',
      status: 'past_due',
      current_period_end: 1_700_000_000,
    } as never);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        status: 'past_due',
        stripeSubscriptionId: 'sub_456',
        currentPeriodEnd: new Date(1_700_000_000 * 1000),
      },
    });
  });

  it('marks subscription canceled on deletion', async () => {
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
      userId: 'user-1',
      currentPeriodEnd: new Date('2026-01-01'),
    } as never);

    await handleSubscriptionDeleted({
      id: 'sub_456',
      customer: 'cus_123',
      ended_at: 1_800_000_000,
    } as never);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        status: 'canceled',
        stripeSubscriptionId: 'sub_456',
        currentPeriodEnd: new Date(1_800_000_000 * 1000),
      },
    });
  });

  it('reactivates subscription on invoice.paid', async () => {
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue({ userId: 'user-1' } as never);

    await handleInvoicePaid({
      customer: 'cus_123',
      subscription: 'sub_456',
    } as never);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        status: 'active',
        stripeSubscriptionId: 'sub_456',
      },
    });
  });

  it('routes known Stripe event types', async () => {
    await processStripeWebhookEvent({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'user-2', plan: 'monthly' } } },
    } as never);

    expect(prisma.subscription.upsert).toHaveBeenCalled();
  });

  it('normalizes plan and status helpers', () => {
    expect(planFromCheckoutMetadata('enterprise')).toBe('ENTERPRISE');
    expect(mapStripeSubscriptionStatus('incomplete_expired')).toBe('canceled');
  });
});
