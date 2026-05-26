import {
  DEFAULT_DONATION_BANK,
  formatIbanDisplay,
  normalizeIban,
  type DonationBankDetails,
} from '@ama/shared/donation-bank';

export { formatIbanDisplay, normalizeIban, type DonationBankDetails };

export function getDonationBankDetails(): DonationBankDetails {
  return {
    beneficiary:
      process.env.EXPO_PUBLIC_DONATION_BANK_BENEFICIARY ?? DEFAULT_DONATION_BANK.beneficiary,
    iban: normalizeIban(
      process.env.EXPO_PUBLIC_DONATION_BANK_IBAN ?? DEFAULT_DONATION_BANK.iban,
    ),
    bic: process.env.EXPO_PUBLIC_DONATION_BANK_BIC ?? DEFAULT_DONATION_BANK.bic,
    bankName: process.env.EXPO_PUBLIC_DONATION_BANK_NAME ?? DEFAULT_DONATION_BANK.bankName,
    bankAddress:
      process.env.EXPO_PUBLIC_DONATION_BANK_ADDRESS ?? DEFAULT_DONATION_BANK.bankAddress,
    correspondentBic:
      process.env.EXPO_PUBLIC_DONATION_BANK_CORRESPONDENT_BIC ??
      DEFAULT_DONATION_BANK.correspondentBic,
    paymentReference:
      process.env.EXPO_PUBLIC_DONATION_BANK_REFERENCE ?? DEFAULT_DONATION_BANK.paymentReference,
  };
}
