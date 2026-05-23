import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApiHealthPoller } from '../src/components/ApiHealthPoller';
import { ApiStatusBanner } from '../src/components/ApiStatusBanner';
import { Toaster } from '../src/components/Toast';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <ThemeProvider>
    <ApiHealthPoller />
    <ApiStatusBanner />
    <Toaster />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quests" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="badges" />
      <Stack.Screen name="sprint" />
      <Stack.Screen name="diagnostics" />
      <Stack.Screen name="about" />
      <Stack.Screen name="glossary" />
      <Stack.Screen name="course/[slug]" />
      <Stack.Screen name="course/[slug]/complete" />
      <Stack.Screen name="course/[slug]/revision" />
      <Stack.Screen name="course/[slug]/examen" />
    </Stack>
    </ThemeProvider>
    </SafeAreaProvider>
  );
}
