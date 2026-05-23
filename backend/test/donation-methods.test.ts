import { describe, expect, it } from 'vitest';
import {
  getDonationPaypalStatus,
  normalizeDonationPaypalUrl,
  resolveDonationPaypalUrl,
} from '@ama/shared/donation-methods';

describe('donation PayPal URL', () => {
  it('accepts PayPal Donate hosted button URLs', () => {
    const url = 'https://www.paypal.com/donate/?hosted_button_id=ABC123';
    expect(normalizeDonationPaypalUrl(url)).toBe(url);
    expect(getDonationPaypalStatus(url)).toBe('configured');
  });

  it('accepts PayPal.Me URLs', () => {
    const url = 'https://paypal.me/mdm-academy';
    expect(normalizeDonationPaypalUrl(url)).toBe(url);
  });

  it('rejects non-HTTPS or unknown hosts', () => {
    expect(normalizeDonationPaypalUrl('http://paypal.me/test')).toBeNull();
    expect(normalizeDonationPaypalUrl('https://example.com/donate')).toBeNull();
    expect(normalizeDonationPaypalUrl('')).toBeNull();
    expect(getDonationPaypalStatus(null)).toBe('unavailable');
  });

  it('prefers public URL over server URL', () => {
    expect(
      resolveDonationPaypalUrl({
        publicUrl: 'https://paypal.me/public',
        serverUrl: 'https://paypal.me/server',
      }),
    ).toBe('https://paypal.me/public');
  });
});
