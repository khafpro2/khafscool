import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WelcomeScreen } from '../src/screens/auth/WelcomeScreen';
import { LearnerDashboardScreen } from '../src/screens/dashboard/LearnerDashboardScreen';
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
        <ActivityIndicator color="#007AFF" />
        <Text style={styles.loadingText}>Vérification de la session…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <LearnerDashboardScreen onSignOut={() => setIsAuthenticated(false)} />;
  }

  return <WelcomeScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' },
  loadingText: { marginTop: 12, color: '#6E6E73', fontSize: 15 },
});
