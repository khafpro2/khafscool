import type Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { awardSupporterBadge } from './supporter-badge.service.js';

export type DonationConfirmationPayload = {
  stripeSessionId: string;
  amountCents: number;
  currency: string;
  email: string | null;
  userId: string | null;
};

/** Stub notification — log only until SendGrid (or similar) is wired. */
export function logDonationConfirmation(payload: DonationConfirmationPayload) {
  console.info('[donation] payment confirmed — email notification stub', payload);
}

export async function handleDonationCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type !== 'donation') return;

  const stripeSessionId = session.id;
  if (!stripeSessionId) return;

  const existing = await prisma.donation.findUnique({
    where: { stripeSessionId },
  });
  if (existing) return;

  const amountCents =
    session.amount_total ??
    Number.parseInt(session.metadata.amountCents ?? '0', 10) ??
    0;
  if (!amountCents || amountCents < 1) return;

  const userId = session.metadata.userId ?? null;

  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const currency = (session.currency ?? 'eur').toLowerCase();

  await prisma.donation.create({
    data: {
      amountCents,
      currency,
      email,
      userId,
      stripeSessionId,
    },
  });

  logDonationConfirmation({
    stripeSessionId,
    amountCents,
    currency,
    email,
    userId,
  });

  if (userId) {
    await awardSupporterBadge(userId);
  }
}
