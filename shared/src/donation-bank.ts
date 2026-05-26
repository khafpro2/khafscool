export const DEFAULT_DONATION_BANK = {
  beneficiary: 'Khalifa Thiam',
  iban: 'FR7628233000019325633272239',
  bic: 'REVOFRP2',
  bankName: 'Revolut Bank UAB',
  bankAddress: '10 avenue Kléber, 75116 Paris, France',
  correspondentBic: 'CHASDEFX',
  paymentReference: 'Soutien MDM Academy',
} as const;

export type DonationBankDetails = {
  beneficiary: string;
  iban: string;
  bic: string;
  bankName: string;
  bankAddress: string;
  correspondentBic: string;
  paymentReference: string;
};

/** Retire les espaces et met en majuscules (copie presse-papiers). */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s/g, '').toUpperCase();
}

/** Affiche l’IBAN en groupes de 4 caractères (ex. FR76 2823 …). */
export function formatIbanDisplay(iban: string): string {
  const normalized = normalizeIban(iban);
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}

export function buildBankTransferShareText(details: DonationBankDetails): string {
  return [
    'Don MDM Academy Pro (virement bancaire)',
    '',
    `Bénéficiaire : ${details.beneficiary}`,
    `IBAN : ${formatIbanDisplay(details.iban)}`,
    `BIC/SWIFT : ${details.bic}`,
    `Banque : ${details.bankName}, ${details.bankAddress}`,
    `Banque correspondante BIC : ${details.correspondentBic}`,
    `Référence libre : ${details.paymentReference}`,
  ].join('\n');
}
