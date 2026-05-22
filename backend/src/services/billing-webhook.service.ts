import type Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { handleDonationCheckoutCompleted } from './donations-webhook.service.js';

export function planFromCheckoutMetadata(plan?: string | null) {
  if (!plan) return 'PRO';
  return plan.toUpperCase();
}

export function mapStripeSubscriptionStatus(stripeStatus: string) {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'incomplete':
      return 'pending';
    case 'incomplete_expired':
      return 'canceled';
    case 'paused':
      return 'paused';
    default:
      return stripeStatus;
  }
}

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type === 'donation') {
    await handleDonationCheckoutCompleted(session);
    return;
  }

  const userId = session.metadata?.userId;
  if (!userId) return;

  const plan = planFromCheckoutMetadata(session.metadata?.plan);
  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);
  const status = session.mode === 'payment' ? 'active' : 'active';

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
    update: {
      plan,
      status,
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
    },
  });
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = stripeId(subscription.customer);
  if (!customerId) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!existing) return;

  const status = mapStripeSubscriptionStatus(subscription.status);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.subscription.update({
    where: { userId: existing.userId },
    data: {
      status,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = stripeId(subscription.customer);
  if (!customerId) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!existing) return;

  await prisma.subscription.update({
    where: { userId: existing.userId },
    data: {
      status: 'canceled',
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: subscription.ended_at
        ? new Date(subscription.ended_at * 1000)
        : existing.currentPeriodEnd,
    },
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = stripeId(invoice.customer);
  if (!customerId) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!existing) return;

  const subscriptionId = stripeId(invoice.subscription);

  await prisma.subscription.update({
    where: { userId: existing.userId },
    data: {
      status: 'active',
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
    },
  });
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}
