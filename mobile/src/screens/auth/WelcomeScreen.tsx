import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
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

export function WelcomeScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

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
        }
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de se connecter. Vérifiez que l’API tourne sur le port 4000.');
    } finally {
      setLoading(null);
    }
  }

  async function handleEmailAuth() {
    try {
      setLoading(authMode);
      const response = await fetch(`${API_URL}/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(authMode === 'register' ? { displayName: displayName.trim() } : {}),
        }),
      });

      if (!response.ok) {
        const message = response.status === 401 ? 'Identifiants invalides.' : 'Vérifiez les champs du formulaire.';
        Alert.alert('Connexion impossible', message);
        return;
      }

      const data = (await response.json()) as { accessToken: string; refreshToken: string };
      await saveTokens(data.accessToken, data.refreshToken);
      Alert.alert('Connexion réussie', 'Bienvenue sur Apple MDM Academy !');
    } catch {
      Alert.alert('Erreur', 'Impossible de joindre l’API. Vérifiez EXPO_PUBLIC_API_URL.');
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

      <View style={styles.form}>
        <View style={styles.tabs}>
          <Pressable onPress={() => setAuthMode('login')} style={[styles.tab, authMode === 'login' && styles.tabActive]}>
            <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>Connexion</Text>
          </Pressable>
          <Pressable
            onPress={() => setAuthMode('register')}
            style={[styles.tab, authMode === 'register' && styles.tabActive]}
          >
            <Text style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}>Inscription</Text>
          </Pressable>
        </View>

        {authMode === 'register' && (
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nom affiché"
            style={styles.input}
            editable={!loading}
          />
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          editable={!loading}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />

        <Pressable style={styles.emailButton} onPress={handleEmailAuth} disabled={!!loading}>
          {loading === authMode ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{authMode === 'login' ? 'Se connecter' : 'Créer le compte'}</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => Alert.alert('API', `Backend configuré sur ${API_URL}`)}>
        <Text style={styles.link}>Vérifier l’URL API</Text>
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
  form: { marginTop: 12, gap: 10 },
  tabs: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 12, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 9 },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { textAlign: 'center', color: '#6E6E73', fontWeight: '600' },
  tabTextActive: { color: '#1D1D1F' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 16 },
  emailButton: { padding: 16, borderRadius: 12, minHeight: 52, justifyContent: 'center', backgroundColor: '#007AFF' },
  link: { marginTop: 16, textAlign: 'center', color: '#007AFF', fontSize: 15 },
});
