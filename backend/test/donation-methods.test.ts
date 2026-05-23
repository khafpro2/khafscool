import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DONATION_PAYPAL_URL,
  getDonationPaypalStatus,
  normalizeDonationPaypalUrl,
  resolveDonationPaypalUrl,
} from '@ama/shared/donation-methods';

describe('donation PayPal URL', () => {
  it('exposes the default PayPal.me URL', () => {
    expect(DEFAULT_DONATION_PAYPAL_URL).toBe('https://www.paypal.com/paypalme/khafpro');
    expect(normalizeDonationPaypalUrl(DEFAULT_DONATION_PAYPAL_URL)).toBe(DEFAULT_DONATION_PAYPAL_URL);
  });

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

  it('falls back to the default PayPal.me URL when env is empty', () => {
    expect(resolveDonationPaypalUrl({})).toBe(DEFAULT_DONATION_PAYPAL_URL);
    expect(getDonationPaypalStatus(resolveDonationPaypalUrl({}))).toBe('configured');
  });
});
