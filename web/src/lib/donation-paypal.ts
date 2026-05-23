import {
  DEFAULT_DONATION_PAYPAL_REFERENCE,
  resolveDonationPaypalUrl,
} from '@ama/shared/donation-methods';

export { DEFAULT_DONATION_PAYPAL_REFERENCE };

export function getDonationPaypalUrl(): string | null {
  return resolveDonationPaypalUrl({
    publicUrl: process.env.NEXT_PUBLIC_DONATION_PAYPAL_URL,
    serverUrl: process.env.DONATION_PAYPAL_URL,
  });
}
