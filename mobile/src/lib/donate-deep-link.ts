import { parseDonationAmountQuery } from '@ama/shared/donation-amounts';
import {
  isDonationPaymentModeId,
  type DonationPaymentModeId,
} from '@ama/shared/donation-payment-modes';

export type DonateDeepLinkParams = {
  amount?: string;
  mode?: DonationPaymentModeId;
};

const DONATE_PATHS = new Set(['/donate', '/soutenir']);

/** Parse une URL scheme ou HTTPS vers /donate ou /soutenir (montant + fragment mode). */
export function parseDonateDeepLink(url: string): DonateDeepLinkParams | null {
  if (!url.trim()) return null;

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    if (!DONATE_PATHS.has(path)) return null;

    const amountParam = parsed.searchParams.get('amount');
    const amountCents = parseDonationAmountQuery(amountParam);
    const fragment = parsed.hash.replace(/^#/, '');
    const mode = isDonationPaymentModeId(fragment) ? fragment : undefined;

    return {
      ...(amountParam && amountCents != null ? { amount: String(amountCents / 100) } : {}),
      ...(mode ? { mode } : {}),
    };
  } catch {
    return null;
  }
}
