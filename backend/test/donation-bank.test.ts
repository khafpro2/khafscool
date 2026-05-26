import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DONATION_BANK,
  formatIbanDisplay,
  normalizeIban,
} from '@ama/shared/donation-bank';

describe('donation bank', () => {
  it('formats IBAN in groups of four characters', () => {
    expect(formatIbanDisplay(DEFAULT_DONATION_BANK.iban)).toBe(
      'FR76 2823 3000 0193 2563 3272 239',
    );
  });

  it('normalizes IBAN by removing spaces and uppercasing', () => {
    expect(normalizeIban('fr76 2823 3000 0193 2563 3272 239')).toBe(
      DEFAULT_DONATION_BANK.iban,
    );
  });

  it('keeps formatted IBAN stable when re-normalized', () => {
    const displayed = formatIbanDisplay(DEFAULT_DONATION_BANK.iban);
    expect(normalizeIban(displayed)).toBe(DEFAULT_DONATION_BANK.iban);
  });
});
