import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WelcomeScreen } from '../src/screens/auth/WelcomeScreen';
import { theme } from '../src/lib/design';
import { getAccessToken } from '../src/services/auth';

export default function Index() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function refreshSession() {
    const token = await getAccessToken();
    setIsAuthenticated(Boolean(token));
    setCheckingSession(false);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.accent} />
        <Text style={styles.loadingText}>Vérification de la session…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  loadingText: { marginTop: 12, color: theme.muted, fontSize: 15 },
});
