import { resolveDonationPaypalUrl } from '@ama/shared/donation-methods';

export function getDonationPaypalUrl(): string | null {
  return resolveDonationPaypalUrl({
    publicUrl: process.env.NEXT_PUBLIC_DONATION_PAYPAL_URL,
    serverUrl: process.env.DONATION_PAYPAL_URL,
  });
}
