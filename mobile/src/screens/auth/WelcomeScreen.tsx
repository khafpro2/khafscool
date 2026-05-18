import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_URL } from '../../config';
import { saveTokens } from '../../services/auth';

WebBrowser.maybeCompleteAuthSession();

const PROVIDERS = [
  { id: 'apple', label: 'Continuer avec Apple', color: '#000000' },
  { id: 'google', label: 'Continuer avec Google', color: '#4285F4' },
  { id: 'microsoft', label: 'Continuer avec Microsoft', color: '#0078D4' },
] as const;

interface WelcomeScreenProps {
  onAuthSuccess?: () => void;
}

export function WelcomeScreen({ onAuthSuccess }: WelcomeScreenProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSSO(provider: (typeof PROVIDERS)[number]['id']) {
    try {
      setLoading(provider);
      const redirectUri = Linking.createURL('auth');
      const authUrl = `${API_URL}/auth/${provider}/start?redirect=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const access = parsed.queryParams?.accessToken;
        const refresh = parsed.queryParams?.refreshToken;
        if (typeof access === 'string' && typeof refresh === 'string') {
          await saveTokens(access, refresh);
          Alert.alert('Connexion réussie', 'Bienvenue sur Apple MDM Academy !');
          onAuthSuccess?.();
        }
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de se connecter. Vérifiez que l’API tourne sur le port 4000.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple MDM Academy</Text>
      <Text style={styles.subtitle}>
        Formation gamifiée pour techniciens Apple et administrateurs MDM
      </Text>

      {PROVIDERS.map((p) => (
        <Pressable
          key={p.id}
          style={[styles.button, { backgroundColor: p.color }]}
          onPress={() => handleSSO(p.id)}
          disabled={!!loading}
        >
          {loading === p.id ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{p.label}</Text>
          )}
        </Pressable>
      ))}

      <Pressable onPress={() => Alert.alert('Email', 'Utilisez POST /auth/register sur l’API ou le site web.')}>
        <Text style={styles.link}>Créer un compte avec email</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F5F5F7' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#1D1D1F' },
  subtitle: { fontSize: 16, color: '#6E6E73', marginBottom: 32, lineHeight: 22 },
  button: { padding: 16, borderRadius: 12, marginBottom: 12, minHeight: 52, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 16, textAlign: 'center', color: '#007AFF', fontSize: 15 },
});
