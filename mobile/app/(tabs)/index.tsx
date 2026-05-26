import { useRouter } from 'expo-router';
import { LearnerDashboardScreen } from '../../src/screens/dashboard/LearnerDashboardScreen';

export default function TabHomeScreen() {
  const router = useRouter();

  return <LearnerDashboardScreen onSignOut={() => router.replace('/')} />;
}
