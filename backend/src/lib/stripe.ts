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
