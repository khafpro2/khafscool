import { useLocalSearchParams } from 'expo-router';
import {
  isDonationPaymentModeId,
  type DonationPaymentModeId,
} from '@ama/shared/donation-payment-modes';
import { DonateScreen } from '../src/screens/donate/DonateScreen';

export default function DonateRoute() {
  const { amount, mode } = useLocalSearchParams<{ amount?: string; mode?: string }>();
  const initialPaymentMode: DonationPaymentModeId | undefined =
    typeof mode === 'string' && isDonationPaymentModeId(mode) ? mode : undefined;

  return (
    <DonateScreen
      initialAmountEuros={typeof amount === 'string' ? amount : undefined}
      initialPaymentMode={initialPaymentMode}
    />
  );
}
