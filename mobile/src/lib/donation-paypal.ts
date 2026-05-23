import { resolveDonationPaypalUrl } from '@ama/shared/donation-methods';

export function getDonationPaypalUrl(): string | null {
  return resolveDonationPaypalUrl({
    publicUrl: process.env.EXPO_PUBLIC_DONATION_PAYPAL_URL,
  });
}
