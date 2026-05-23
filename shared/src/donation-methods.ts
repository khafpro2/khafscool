export type DonationPaypalStatus = 'configured' | 'unavailable';

/** Lien PayPal.Me par défaut (HarmyTech / Khalifa Thiam) — override via env. */
export const DEFAULT_DONATION_PAYPAL_URL = 'https://www.paypal.com/paypalme/khafpro';

/** Référence ou message optionnel suggéré sur la page PayPal. */
export const DEFAULT_DONATION_PAYPAL_REFERENCE = 'MDM Academy';

const PAYPAL_HOSTS = new Set(['paypal.com', 'paypal.me']);

function isAllowedPaypalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (PAYPAL_HOSTS.has(host)) return true;
  return host.endsWith('.paypal.com');
}

/** Valide et normalise une URL PayPal Donate ou PayPal.Me (https uniquement). */
export function normalizeDonationPaypalUrl(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    if (!isAllowedPaypalHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function resolveDonationPaypalUrl(sources: {
  publicUrl?: string | null;
  serverUrl?: string | null;
  defaultUrl?: string | null;
}): string | null {
  return (
    normalizeDonationPaypalUrl(sources.publicUrl) ??
    normalizeDonationPaypalUrl(sources.serverUrl) ??
    normalizeDonationPaypalUrl(sources.defaultUrl ?? DEFAULT_DONATION_PAYPAL_URL)
  );
}

export function getDonationPaypalStatus(url: string | null): DonationPaypalStatus {
  return url ? 'configured' : 'unavailable';
}
