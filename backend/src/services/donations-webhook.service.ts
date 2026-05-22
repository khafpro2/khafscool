import type Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';

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

  await prisma.donation.create({
    data: {
      amountCents,
      currency: (session.currency ?? 'eur').toLowerCase(),
      email: session.customer_details?.email ?? session.customer_email ?? null,
      userId: session.metadata.userId ?? null,
      stripeSessionId,
    },
  });
}
