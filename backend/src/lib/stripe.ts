import Stripe from 'stripe';

export type StripeCheckoutPlan = 'monthly' | 'yearly' | 'enterprise';

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeClient;
}

export function resetStripeClientForTests() {
  stripeClient = null;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? null;
}

export function stripeWebhookReady() {
  return Boolean(isStripeConfigured() && getStripeWebhookSecret());
}

function priceIdForPlan(plan: StripeCheckoutPlan) {
  if (plan === 'monthly') return process.env.STRIPE_PRICE_ID_MONTHLY?.trim();
  if (plan === 'yearly') return process.env.STRIPE_PRICE_ID_YEARLY?.trim();
  return process.env.STRIPE_PRICE_ID_ENTERPRISE?.trim();
}

export function stripeCheckoutReady() {
  if (!isStripeConfigured()) return false;
  return Boolean(
    process.env.STRIPE_PRICE_ID_MONTHLY?.trim() &&
      process.env.STRIPE_PRICE_ID_YEARLY?.trim() &&
      process.env.STRIPE_PRICE_ID_ENTERPRISE?.trim()
  );
}

export const DONATION_PRESET_AMOUNTS_CENTS = [500, 1000, 2000] as const;

export function getDonationFallbackUrl() {
  return process.env.DONATION_URL?.trim() ?? null;
}

export function donationCheckoutReady() {
  return isStripeConfigured();
}

export function resolveDonationPriceId(amountCents: number) {
  if (amountCents === 500) return process.env.STRIPE_DONATION_PRICE_ID_5?.trim();
  if (amountCents === 1000) return process.env.STRIPE_DONATION_PRICE_ID_10?.trim();
  if (amountCents === 2000) return process.env.STRIPE_DONATION_PRICE_ID_20?.trim();
  return null;
}

export async function createDonationCheckoutSession(params: {
  amountCents: number;
  userId?: string | null;
  customerEmail?: string | null;
}) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  const webUrl = (process.env.WEB_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
  const priceId = resolveDonationPriceId(params.amountCents);
  const lineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: 'eur',
          unit_amount: params.amountCents,
          product_data: {
            name: 'Don à MDM Academy Pro',
            description: 'Soutien volontaire — la formation reste 100 % gratuite.',
          },
        },
        quantity: 1,
      };

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [lineItem],
    success_url: `${webUrl}/soutenir?checkout=success`,
    cancel_url: `${webUrl}/soutenir?checkout=cancel`,
    customer_email: params.customerEmail ?? undefined,
    metadata: {
      type: 'donation',
      amountCents: String(params.amountCents),
      ...(params.userId ? { userId: params.userId } : {}),
    },
  });
}

export async function createStripeCheckoutSession(params: {
  plan: StripeCheckoutPlan;
  userId: string;
  customerEmail?: string | null;
}) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  const priceId = priceIdForPlan(params.plan);
  if (!priceId) {
    throw new Error('STRIPE_PRICE_NOT_CONFIGURED');
  }

  const webUrl = (process.env.WEB_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
  const mode = params.plan === 'enterprise' ? 'payment' : 'subscription';

  return stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${webUrl}/pricing?checkout=success&plan=${params.plan}`,
    cancel_url: `${webUrl}/pricing?checkout=cancel&plan=${params.plan}`,
    customer_email: params.customerEmail ?? undefined,
    metadata: {
      userId: params.userId,
      plan: params.plan,
    },
  });
}
