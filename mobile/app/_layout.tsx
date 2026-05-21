import { Stack } from 'expo-router';
import { ApiHealthPoller } from '../src/components/ApiHealthPoller';
import { ApiStatusBanner } from '../src/components/ApiStatusBanner';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
    <ApiHealthPoller />
    <ApiStatusBanner />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quests" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="badges" />
      <Stack.Screen name="sprint" />
      <Stack.Screen name="course/[slug]" />
      <Stack.Screen name="course/[slug]/complete" />
    </Stack>
    </ThemeProvider>
  );
}
