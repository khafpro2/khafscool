import {
  DEFAULT_DONATION_BANK,
  formatIbanDisplay,
  normalizeIban,
  type DonationBankDetails,
} from '@ama/shared/donation-bank';

export { formatIbanDisplay, normalizeIban, type DonationBankDetails };

function readEnv(key: string, fallback: string): string {
  return (
    process.env[`NEXT_PUBLIC_${key}`] ??
    process.env[key] ??
    fallback
  );
}

export function getDonationBankDetails(): DonationBankDetails {
  return {
    beneficiary: readEnv('DONATION_BANK_BENEFICIARY', DEFAULT_DONATION_BANK.beneficiary),
    iban: normalizeIban(readEnv('DONATION_BANK_IBAN', DEFAULT_DONATION_BANK.iban)),
    bic: readEnv('DONATION_BANK_BIC', DEFAULT_DONATION_BANK.bic),
    bankName: readEnv('DONATION_BANK_NAME', DEFAULT_DONATION_BANK.bankName),
    bankAddress: readEnv('DONATION_BANK_ADDRESS', DEFAULT_DONATION_BANK.bankAddress),
    correspondentBic: readEnv(
      'DONATION_BANK_CORRESPONDENT_BIC',
      DEFAULT_DONATION_BANK.correspondentBic,
    ),
    paymentReference: readEnv(
      'DONATION_BANK_REFERENCE',
      DEFAULT_DONATION_BANK.paymentReference,
    ),
  };
}
