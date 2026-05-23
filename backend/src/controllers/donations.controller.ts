import {
  getDonationPaypalStatus,
  normalizeDonationPaypalUrl,
} from '@ama/shared/donation-methods';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  createDonationCheckoutSession,
  donationCheckoutReady,
  DONATION_PRESET_AMOUNTS_CENTS,
  getDonationFallbackUrl,
  isStripeConfigured,
} from '../lib/stripe.js';

const MIN_DONATION_CENTS = 100;
const MAX_DONATION_CENTS = 100_000;

const donationCheckoutSchema = z.object({
  amountCents: z
    .number({
      required_error: 'amountCents est requis',
      invalid_type_error: 'amountCents doit être un nombre entier',
    })
    .int('amountCents doit être un entier')
    .min(MIN_DONATION_CENTS, `Le montant minimum est ${MIN_DONATION_CENTS / 100} €`)
    .max(MAX_DONATION_CENTS, `Le montant maximum est ${MAX_DONATION_CENTS / 100} €`),
});

export function parseDonationCheckoutRequest(body: unknown) {
  return donationCheckoutSchema.safeParse(body ?? {});
}

function getDonationPaypalUrlFromEnv() {
  return normalizeDonationPaypalUrl(process.env.DONATION_PAYPAL_URL);
}

function buildPaypalStatusBlock() {
  const paypalUrl = getDonationPaypalUrlFromEnv();
  return {
    status: getDonationPaypalStatus(paypalUrl),
  } as const;
}

export function buildDonationStatusResponse() {
  const stripeConfigured = isStripeConfigured();
  const checkoutEnabled = donationCheckoutReady();
  const fallbackUrl = getDonationFallbackUrl();
  const paypal = buildPaypalStatusBlock();

  if (checkoutEnabled) {
    return {
      mode: 'live' as const,
      stripe: {
        configured: true,
        checkoutEnabled: true,
      },
      paypal,
      fallbackUrl,
      suggestedAmountsCents: [...DONATION_PRESET_AMOUNTS_CENTS],
    };
  }

  if (fallbackUrl) {
    return {
      mode: 'fallback' as const,
      stripe: {
        configured: stripeConfigured,
        checkoutEnabled: false,
      },
      paypal,
      fallbackUrl,
      suggestedAmountsCents: [...DONATION_PRESET_AMOUNTS_CENTS],
      message: 'Paiement externe — la formation reste 100 % gratuite.',
    };
  }

  return {
    mode: 'unavailable' as const,
    stripe: {
      configured: stripeConfigured,
      checkoutEnabled: false,
    },
    paypal,
    fallbackUrl: null,
    suggestedAmountsCents: [...DONATION_PRESET_AMOUNTS_CENTS],
    message: 'Bientôt disponible — merci pour votre intérêt !',
  };
}

export async function getDonationStatus(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(buildDonationStatusResponse());
}

function escapeCsvField(value: string | number | null | undefined) {
  if (value == null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function exportDonationsCsv(_req: FastifyRequest, reply: FastifyReply) {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amountCents: true,
      currency: true,
      email: true,
      userId: true,
      stripeSessionId: true,
      createdAt: true,
    },
  });

  const header = 'id,amountCents,currency,email,userId,stripeSessionId,createdAt';
  const rows = donations.map((donation) =>
    [
      escapeCsvField(donation.id),
      escapeCsvField(donation.amountCents),
      escapeCsvField(donation.currency),
      escapeCsvField(donation.email),
      escapeCsvField(donation.userId),
      escapeCsvField(donation.stripeSessionId),
      escapeCsvField(donation.createdAt.toISOString()),
    ].join(',')
  );

  return reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', 'attachment; filename="donations-export.csv"')
    .send([header, ...rows].join('\n'));
}

export async function getDonationStats(_req: FastifyRequest, reply: FastifyReply) {
  const [aggregate, latest] = await Promise.all([
    prisma.donation.aggregate({
      _count: { _all: true },
      _sum: { amountCents: true },
    }),
    prisma.donation.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);

  return reply.send({
    totalCount: aggregate._count._all,
    totalAmountCents: aggregate._sum.amountCents ?? 0,
    currency: 'eur',
    lastDonationAt: latest?.createdAt.toISOString() ?? null,
  });
}

export async function createDonationCheckout(
  req: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const parsedBody = parseDonationCheckoutRequest(req.body);
  if (!parsedBody.success) {
    return reply.status(400).send({
      error: 'INVALID_DONATION_CHECKOUT_REQUEST',
      details: parsedBody.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
  }

  const { amountCents } = parsedBody.data;
  const fallbackUrl = getDonationFallbackUrl();

  if (!donationCheckoutReady()) {
    if (fallbackUrl) {
      return reply.send({
        mode: 'fallback' as const,
        checkoutUrl: fallbackUrl,
        amountCents,
        message: 'Redirection vers la page de don externe.',
      });
    }

    return reply.status(503).send({
      error: 'DONATION_CHECKOUT_UNAVAILABLE',
      message: 'Les dons en ligne ne sont pas encore disponibles.',
    });
  }

  try {
    const userId = req.user?.sub;
    let customerEmail: string | null = null;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      customerEmail = user?.email ?? null;
    }

    const session = await createDonationCheckoutSession({
      amountCents,
      userId,
      customerEmail,
    });

    if (!session.url) {
      return reply.status(502).send({
        error: 'STRIPE_CHECKOUT_URL_MISSING',
        message: 'Stripe a répondu sans URL de redirection.',
      });
    }

    return reply.send({
      mode: 'live' as const,
      checkoutUrl: session.url,
      amountCents,
      sessionId: session.id,
    });
  } catch (error) {
    req.log.error({ err: error }, 'donation checkout session failed');
    return reply.status(502).send({
      error: 'STRIPE_CHECKOUT_FAILED',
      message: 'Impossible de créer la session Stripe. Réessaie plus tard.',
    });
  }
}
