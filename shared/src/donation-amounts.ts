/** Montants suggérés en centimes (5 €, 10 €, 20 €). */
export const PRESET_DONATION_AMOUNTS_CENTS = [500, 1000, 2000] as const;

export function formatDonationEuros(amountCents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

/** Parse le paramètre de requête `?amount=` (euros entiers, 1–1000). */
export function parseDonationAmountQuery(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) return null;
  return parsed * 100;
}

/** Référence virement avec montant choisi (ex. « MDM Academy - 10€ »). */
export function buildDonationBankReference(baseReference: string, amountCents: number): string {
  const euros = amountCents / 100;
  return `${baseReference} - ${euros}€`;
}

export type PaypalAmountUrlResult = {
  url: string;
  /** true si le montant est transmis dans l’URL (PayPal.Me / hosted button). */
  amountInUrl: boolean;
};

/**
 * Ajoute le montant à une URL PayPal si le format le permet.
 * PayPal.Me : `/username/10EUR` — hosted donate : `?amount=10`.
 */
export function buildPaypalUrlWithAmount(
  baseUrl: string,
  amountCents: number | null,
): PaypalAmountUrlResult {
  if (!amountCents) {
    return { url: baseUrl, amountInUrl: false };
  }

  const euros = amountCents / 100;

  try {
    const url = new URL(baseUrl);
    const host = url.hostname.toLowerCase();
    const isPaypalMe =
      host === 'paypal.me' || host.endsWith('.paypal.me') || url.pathname.includes('/paypalme/');

    if (isPaypalMe) {
      const segments = url.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && /^\d+(\.\d+)?(EUR|USD|GBP)?$/i.test(last)) {
        segments.pop();
      }
      segments.push(`${euros}EUR`);
      url.pathname = `/${segments.join('/')}`;
      url.search = '';
      return { url: url.toString(), amountInUrl: true };
    }

    url.searchParams.set('amount', String(euros));
    return { url: url.toString(), amountInUrl: true };
  } catch {
    return { url: baseUrl, amountInUrl: false };
  }
}
