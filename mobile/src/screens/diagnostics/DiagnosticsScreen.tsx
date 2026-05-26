import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL, WEB_URL } from '../../config';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { getAccessToken, getRefreshToken } from '../../services/auth';

type CheckStatus = 'pending' | 'ok' | 'error' | 'warning';

type DiagnosticCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

const initialCheck = (label: string): DiagnosticCheck => ({
  id: label,
  label,
  status: 'pending',
  detail: 'Vérification en cours…',
});

function statusLabel(status: CheckStatus) {
  if (status === 'ok') return 'OK';
  if (status === 'warning') return 'À vérifier';
  if (status === 'error') return 'Erreur';
  return 'En cours';
}

export function DiagnosticsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [checks, setChecks] = useState<DiagnosticCheck[]>([
    initialCheck('Santé API (/health)'),
    initialCheck('Version backend'),
    initialCheck('URL API configurée'),
    initialCheck('Session mobile (jetons)'),
  ]);

  const runChecks = useCallback(async () => {
    setLoading(true);
    const [health, tokens] = await Promise.all([checkHealth(), checkTokens()]);
    setApiVersion(health.version);
    setChecks([
      health.check,
      {
        id: 'api-version',
        label: 'Version backend',
        status: health.version ? 'ok' : health.check.status === 'error' ? 'warning' : 'warning',
        detail: health.version
          ? `Version ${health.version} exposée par l’API.`
          : 'Champ version absent — redémarre le backend sur la branche courante.',
      },
      checkApiUrl(),
      tokens,
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <Text style={styles.eyebrow}>Outils internes</Text>
      <Text style={styles.title}>Diagnostics MVP</Text>
      <Text style={styles.lead}>
        Vérifie l’API, la version backend et la configuration mobile — parité simplifiée avec la page web{' '}
        <Text style={styles.inlineCode}>/diagnostics</Text>.
      </Text>

      <Pressable style={styles.primaryButton} onPress={() => void runChecks()} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Relancer les vérifications</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Synthèse</Text>
      {checks.map((item) => (
        <View key={item.id} style={[styles.checkCard, { borderColor: statusColor(item.status, colors) }]}>
          <View style={styles.checkHeader}>
            <Text style={styles.checkLabel}>{item.label}</Text>
            <Text style={[styles.checkBadge, { color: statusColor(item.status, colors) }]}>
              {statusLabel(item.status)}
            </Text>
          </View>
          <Text style={styles.checkDetail}>{item.detail}</Text>
        </View>
      ))}

      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Configuration</Text>
        <Text style={styles.metaLine}>
          API : <Text style={styles.inlineCode}>{API_URL}</Text>
        </Text>
        <Text style={styles.metaLine}>
          Web : <Text style={styles.inlineCode}>{WEB_URL}</Text>
        </Text>
        {apiVersion ? (
          <Text style={styles.metaLine}>
            Version détectée : <Text style={styles.inlineCode}>{apiVersion}</Text>
          </Text>
        ) : null}
      </View>

      <Text style={styles.footerNote}>
        Aucun jeton ni secret n’est affiché. Pour les contrôles DB et catalogue, ouvre la page web Diagnostics.
      </Text>
    </ScrollView>
  );
}

async function checkHealth(): Promise<{ check: DiagnosticCheck; version: string | null }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        check: {
          id: 'api-health',
          label: 'Santé API (/health)',
          status: 'error',
          detail: `Erreur HTTP ${res.status} sur /health.`,
        },
        version: null,
      };
    }

    const data = (await res.json()) as { ok?: boolean; service?: string; version?: string };
    if (!data.ok) {
      return {
        check: {
          id: 'api-health',
          label: 'Santé API (/health)',
          status: 'warning',
          detail: 'Réponse reçue, mais le champ ok est absent ou faux.',
        },
        version: data.version ?? null,
      };
    }

    const versionSuffix = data.version ? ` · v${data.version}` : '';
    return {
      check: {
        id: 'api-health',
        label: 'Santé API (/health)',
        status: 'ok',
        detail: `OK — ${data.service ?? 'service API joignable'}${versionSuffix}.`,
      },
      version: data.version ?? null,
    };
  } catch {
    return {
      check: {
        id: 'api-health',
        label: 'Santé API (/health)',
        status: 'error',
        detail: 'API indisponible. Vérifie que le backend écoute sur l’URL configurée.',
      },
      version: null,
    };
  }
}

function checkApiUrl(): DiagnosticCheck {
  const configured = Boolean(API_URL?.trim());
  return {
    id: 'api-url',
    label: 'URL API configurée',
    status: configured ? 'ok' : 'error',
    detail: configured
      ? `EXPO_PUBLIC_API_URL → ${API_URL}`
      : 'Variable EXPO_PUBLIC_API_URL absente — fallback localhost:4000.',
  };
}

async function checkTokens(): Promise<DiagnosticCheck> {
  const [access, refresh] = await Promise.all([getAccessToken(), getRefreshToken()]);
  const hasAccess = Boolean(access);
  const hasRefresh = Boolean(refresh);

  if (hasAccess && hasRefresh) {
    return {
      id: 'auth-session',
      label: 'Session mobile (jetons)',
      status: 'ok',
      detail: 'Jetons d’accès et de rafraîchissement présents (valeurs masquées).',
    };
  }

  if (hasAccess || hasRefresh) {
    return {
      id: 'auth-session',
      label: 'Session mobile (jetons)',
      status: 'warning',
      detail: 'Session incomplète — reconnecte-toi depuis l’écran d’accueil.',
    };
  }

  return {
    id: 'auth-session',
    label: 'Session mobile (jetons)',
    status: 'error',
    detail: 'Aucun jeton actif — connecte-toi pour tester le dashboard synchronisé.',
  };
}

function statusColor(status: CheckStatus, colors: AppThemeColors) {
  if (status === 'ok') return colors.success;
  if (status === 'warning') return colors.warning;
  if (status === 'error') return '#B3261E';
  return colors.accent;
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    backButton: { marginBottom: 12, alignSelf: 'flex-start' },
    backText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    eyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    title: { color: colors.fg, fontSize: 28, fontWeight: '800', marginTop: 6 },
    lead: { color: colors.muted, marginTop: 10, lineHeight: 22, fontSize: 15 },
    inlineCode: { fontWeight: '700', color: colors.fg },
    primaryButton: {
      marginTop: 16,
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingVertical: 14,
      alignItems: 'center',
      minHeight: 48,
      justifyContent: 'center',
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800', marginTop: 24, marginBottom: 12 },
    checkCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
    },
    checkHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
    checkLabel: { flex: 1, color: colors.fg, fontWeight: '800', fontSize: 14 },
    checkBadge: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    checkDetail: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 13 },
    metaCard: {
      marginTop: 16,
      backgroundColor: colors.accentSoft,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaLabel: { color: colors.fg, fontWeight: '800', marginBottom: 8 },
    metaLine: { color: colors.muted, lineHeight: 22, fontSize: 13, marginTop: 4 },
    footerNote: { color: colors.muted, marginTop: 20, lineHeight: 20, fontSize: 12 },
  });
}
