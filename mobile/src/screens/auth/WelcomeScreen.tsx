import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_URL } from '../../config';
import { theme } from '../../lib/design';
import { loginWithEmail, registerWithEmail } from '../../services/api';
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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleEmailAuth() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError('Renseigne ton email et ton mot de passe.');
      return;
    }

    setFormError(null);
    setLoading('email');

    try {
      const auth =
        mode === 'login'
          ? await loginWithEmail(trimmedEmail, password)
          : await registerWithEmail(
              trimmedEmail,
              password,
              displayName.trim() || trimmedEmail.split('@')[0]
            );
      await saveTokens(auth.accessToken, auth.refreshToken);
      Alert.alert(
        mode === 'login' ? 'Connexion réussie' : 'Compte créé',
        'Bienvenue sur MDM Academy Pro !'
      );
      onAuthSuccess?.();
    } catch {
      setFormError(
        mode === 'login'
          ? 'Connexion impossible. Vérifie tes identifiants ou que l’API tourne sur le port 4000.'
          : 'Inscription impossible. Cet email existe peut-être déjà.'
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleSSO(provider: (typeof PROVIDERS)[number]['id']) {
    try {
      setLoading(provider);
      setFormError(null);
      const redirectUri = Linking.createURL('auth');
      const authUrl = `${API_URL}/auth/${provider}/start?redirect=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const access = parsed.queryParams?.accessToken;
        const refresh = parsed.queryParams?.refreshToken;
        if (typeof access === 'string' && typeof refresh === 'string') {
          await saveTokens(access, refresh);
          Alert.alert('Connexion réussie', 'Bienvenue sur MDM Academy Pro !');
          onAuthSuccess?.();
        }
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de se connecter. Vérifiez que l’API tourne sur le port 4000.');
    } finally {
      setLoading(null);
    }
  }

  const isBusy = Boolean(loading);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>MDM Academy Pro</Text>
        <Text style={styles.title}>Apple MDM Academy</Text>
        <Text style={styles.subtitle}>
          Formation gamifiée gratuite pour techniciens Apple et administrateurs MDM
        </Text>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
            onPress={() => setMode('login')}
            disabled={isBusy}
          >
            <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
              Connexion
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
            onPress={() => setMode('register')}
            disabled={isBusy}
          >
            <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
              Inscription
            </Text>
          </Pressable>
        </View>

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Nom affiché (optionnel)"
            placeholderTextColor={theme.muted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            editable={!isBusy}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isBusy}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor={theme.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isBusy}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Pressable
          style={[styles.primaryCta, isBusy && styles.disabled]}
          onPress={() => void handleEmailAuth()}
          disabled={isBusy}
        >
          {loading === 'email' ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryCtaText}>
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte gratuit'}
            </Text>
          )}
        </Pressable>

        <Text style={styles.dividerLabel}>ou continuer avec</Text>

        {PROVIDERS.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.ssoButton, { borderColor: p.color }, isBusy && styles.disabled]}
            onPress={() => void handleSSO(p.id)}
            disabled={isBusy}
          >
            {loading === p.id ? (
              <ActivityIndicator color={p.color} />
            ) : (
              <Text style={[styles.ssoButtonText, { color: p.color }]}>{p.label}</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  eyebrow: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: theme.fg },
  subtitle: { fontSize: 16, color: theme.muted, marginBottom: 20, lineHeight: 22 },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    backgroundColor: theme.accentSoft,
    borderRadius: theme.radiusMd,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radiusMd - 2,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: theme.bgSoft, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  modeBtnText: { fontWeight: '700', color: theme.muted, fontSize: 14 },
  modeBtnTextActive: { color: theme.accent },
  input: {
    backgroundColor: theme.bgSoft,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.fg,
    marginBottom: 10,
  },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 10 },
  primaryCta: {
    backgroundColor: theme.accent,
    padding: 16,
    borderRadius: theme.radiusLg,
    marginTop: 4,
    marginBottom: 20,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryCtaText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '800', fontSize: 16 },
  dividerLabel: {
    textAlign: 'center',
    color: theme.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  ssoButton: {
    padding: 14,
    borderRadius: theme.radiusMd,
    marginBottom: 10,
    minHeight: 50,
    justifyContent: 'center',
    backgroundColor: theme.bgSoft,
    borderWidth: 1.5,
  },
  ssoButtonText: { textAlign: 'center', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.65 },
});
