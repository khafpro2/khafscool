import { apiFetch } from './api';

export type DonationMode = 'live' | 'fallback' | 'unavailable';

export type DonationPaypalStatus = 'configured' | 'unavailable';

export type DonationStatusResponse = {
  mode: DonationMode;
  stripe: {
    configured: boolean;
    checkoutEnabled: boolean;
  };
  paypal?: {
    status: DonationPaypalStatus;
  };
  fallbackUrl?: string | null;
  suggestedAmountsCents: number[];
  message?: string;
};

export type DonationCheckoutResponse = {
  mode: 'live' | 'fallback';
  checkoutUrl?: string;
  amountCents: number;
  sessionId?: string;
  message?: string;
};

const DEFAULT_DONATION_STATUS: DonationStatusResponse = {
  mode: 'unavailable',
  stripe: { configured: false, checkoutEnabled: false },
  fallbackUrl: null,
  suggestedAmountsCents: [500, 1000, 2000],
  message: 'Bientôt disponible — merci pour votre intérêt !',
};

export async function fetchDonationStatus(): Promise<DonationStatusResponse> {
  try {
    return await apiFetch<DonationStatusResponse>('/donations/status');
  } catch {
    return DEFAULT_DONATION_STATUS;
  }
}

export async function createDonationCheckout(amountCents: number): Promise<DonationCheckoutResponse> {
  return apiFetch<DonationCheckoutResponse>('/donations/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ amountCents }),
  });
}
