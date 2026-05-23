export type DonationPaymentModeId = 'carte' | 'paypal' | 'virement';

export const DONATION_PAYMENT_MODES: ReadonlyArray<{
  id: DonationPaymentModeId;
  icon: string;
  label: string;
  hint: string;
}> = [
  {
    id: 'carte',
    icon: '💳',
    label: 'Carte bancaire',
    hint: 'Visa, Mastercard via Stripe',
  },
  {
    id: 'paypal',
    icon: '🅿️',
    label: 'PayPal',
    hint: 'paypal.me/khafpro',
  },
  {
    id: 'virement',
    icon: '🏦',
    label: 'Virement bancaire',
    hint: 'SEPA Revolut',
  },
];

export function isDonationPaymentModeId(value: string): value is DonationPaymentModeId {
  return value === 'carte' || value === 'paypal' || value === 'virement';
}
