import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import {
  CertificationSprintDays,
  CertificationSprintSummary,
  CertificationSprintTrack,
  fetchCurrentCertificationSprint,
  startCertificationSprint,
} from '../../services/sprint';

const TRACK_OPTIONS: CertificationSprintTrack[] = ['APPLE', 'JAMF', 'INTUNE'];
const DAY_OPTIONS: CertificationSprintDays[] = [7, 14];

const TRACK_DESCRIPTIONS: Record<CertificationSprintTrack, string> = {
  APPLE: 'Device Support, sécurité, diagnostic et fondamentaux MDM Apple.',
  JAMF: 'Smart groups, politiques, inventaire et bonnes pratiques Jamf Pro.',
  INTUNE: 'Enrôlement mobile, conformité, profils et intégration Microsoft.',
};

const SPRINT_PLAN_COPY: Record<
  CertificationSprintDays,
  { title: string; description: string; modulesHint: string }
> = {
  7: {
    title: 'Sprint 7 jours',
    description: 'Idéal pour réviser vite — rythme soutenu sur les unités clés avant une certification proche.',
    modulesHint: '4 unités ciblées',
  },
  14: {
    title: 'Sprint 14 jours',
    description: 'Rythme confortable — plus de marge pour consolider chaque piste Apple, Jamf ou Intune.',
    modulesHint: '4 unités + révisions',
  },
};

export function SprintScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [selectedTrack, setSelectedTrack] = useState<CertificationSprintTrack>('APPLE');
  const [selectedDays, setSelectedDays] = useState<CertificationSprintDays>(7);
  const [sprint, setSprint] = useState<CertificationSprintSummary | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSprint = useCallback(async () => {
    setLoading(true);
    const result = await fetchCurrentCertificationSprint();
    setSprint(result.data);
    setSource(result.source);
    setMessage(
      result.source === 'demo'
        ? 'Mode démo : connecte-toi pour enregistrer un vrai sprint.'
        : result.data
          ? 'Sprint courant chargé depuis GET /sprints/certification/current.'
          : 'Aucun sprint actif pour le moment.'
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSprint();
  }, [loadSprint]);

  async function handleStartSprint() {
    setStarting(true);
    setMessage(null);

    try {
      const result = await startCertificationSprint({ track: selectedTrack, days: selectedDays });
      setSprint(result.data);
      setSource(result.source);
      setMessage(
        result.source === 'demo'
          ? 'Sprint de démonstration démarré localement.'
          : 'Sprint démarré via POST /sprints/certification/start.'
      );
    } catch {
      setMessage('Le démarrage a échoué. Réessaie après connexion ou vérifie l’API.');
    } finally {
      setStarting(false);
    }
  }

  const sprintVisual = getTrackVisual('SPRINT');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement du sprint…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Retour</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: sprintVisual.gradient[0] }]}>
        <Text style={styles.heroEyebrow}>{sprintVisual.icon ?? '\u{26A1}'} Certification Sprint</Text>
        <Text style={styles.heroTitle}>Accélère ta préparation certification</Text>
        <Text style={styles.heroCopy}>
          Défi guidé sur 7 ou 14 jours sur Apple, Jamf ou Intune. Termine le cycle pour débloquer ton badge.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connecte-toi pour synchroniser ton sprint via l’API certification.
          </Text>
        </View>
      ) : null}

      {message ? (
        <View style={styles.messageBanner}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <CurrentSprintCard sprint={sprint} styles={styles} colors={colors} />

      <Text style={styles.sectionEyebrow}>Nouveau sprint</Text>
      <Text style={styles.sectionTitle}>Démarrer un sprint</Text>

      <Text style={styles.fieldLabel}>Piste cible</Text>
      <View style={styles.trackList}>
        {TRACK_OPTIONS.map((track) => {
          const selected = selectedTrack === track;
          const trackVisual = getTrackVisual(track);
          return (
            <Pressable
              key={track}
              onPress={() => setSelectedTrack(track)}
              style={[styles.trackOption, selected ? styles.trackOptionSelected : null]}
            >
              <View style={styles.trackOptionHeader}>
                <TrackIcon track={track} size="sm" />
                <Text style={styles.trackOptionTitle}>{formatTrack(track)}</Text>
              </View>
              <Text style={styles.trackOptionDescription}>{TRACK_DESCRIPTIONS[track]}</Text>
              {selected ? (
                <View style={[styles.selectedPill, { backgroundColor: trackVisual.color + '22' }]}>
                  <Text style={[styles.selectedPillText, { color: trackVisual.color }]}>Sélectionné</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Durée du sprint</Text>
      <View style={styles.dayRow}>
        {DAY_OPTIONS.map((days) => {
          const selected = selectedDays === days;
          const copy = SPRINT_PLAN_COPY[days];
          return (
            <Pressable
              key={days}
              onPress={() => setSelectedDays(days)}
              style={[styles.dayOption, selected ? styles.dayOptionSelected : null]}
            >
              <Text style={styles.dayOptionTitle}>{copy.title}</Text>
              <Text style={styles.dayOptionHint}>{copy.modulesHint}</Text>
              <Text style={styles.dayOptionDescription}>{copy.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        disabled={starting}
        onPress={handleStartSprint}
        style={[styles.startButton, starting ? styles.startButtonDisabled : null]}
      >
        {starting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.startButtonText}>Démarrer ce sprint</Text>
        )}
      </Pressable>

      <Pressable onPress={loadSprint} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le sprint</Text>
      </Pressable>
    </ScrollView>
  );
}

function CurrentSprintCard({
  sprint,
  styles,
  colors,
}: {
  sprint: CertificationSprintSummary | null;
  styles: ReturnType<typeof createStyles>;
  colors: AppThemeColors;
}) {
  if (!sprint) {
    return (
      <View style={styles.currentCard}>
        <Text style={styles.currentEyebrow}>Sprint courant</Text>
        <Text style={styles.currentTitle}>Aucun sprint actif</Text>
        <Text style={styles.currentCopy}>
          Défi guidé sur 7 ou 14 jours sur Apple, Jamf ou Intune. Termine le cycle pour débloquer ton badge.
        </Text>
      </View>
    );
  }

  const statusLabel = formatSprintStatus(sprint);
  const daysRemaining = computeDaysRemaining(sprint.endsAt);
  const endsAtLabel = new Date(sprint.endsAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <View style={styles.currentCard}>
      <View style={styles.currentHeader}>
        <TrackIcon track={sprint.track} size="sm" />
        <Text style={styles.currentEyebrow}>Sprint courant</Text>
      </View>
      <Text style={styles.currentTitle}>{sprint.label}</Text>
      <Text style={styles.currentMeta}>
        {sprint.days} jours · fin prévue le {endsAtLabel}
      </Text>
      <ProgressBar
        progress={Math.min(100, sprint.progressPercent)}
        fillColor={sprint.completed ? colors.success : colors.accent}
        styles={styles}
      />
      <Text style={styles.currentProgress}>
        {sprint.progress}/{sprint.target} unités · {sprint.progressPercent} % complété
      </Text>
      <View style={styles.metricsRow}>
        <SprintMetric label="Restants" value={String(sprint.remainingModules)} styles={styles} />
        <SprintMetric label="Jours restants" value={String(daysRemaining)} styles={styles} />
        <SprintMetric label="Parcours" value={formatTrack(sprint.track)} styles={styles} />
        <SprintMetric label="Statut" value={statusLabel} styles={styles} />
      </View>
    </View>
  );
}

function SprintMetric({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({
  progress,
  fillColor,
  styles,
}: {
  progress: number;
  fillColor: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

function formatSprintStatus(sprint: CertificationSprintSummary) {
  if (sprint.completed) return 'Terminé';
  if (sprint.expired) return 'Expiré';
  return 'Actif';
}

function computeDaysRemaining(endsAt: string) {
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
    backLink: { marginBottom: 12 },
    backLinkText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    heroCard: { borderRadius: colors.radiusLg, padding: 20, marginBottom: 16 },
    heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 8 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
    heroCopy: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
    demoBanner: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: colors.radiusLg,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    demoText: { color: colors.demoBannerText, lineHeight: 20, fontWeight: '600' },
    messageBanner: {
      backgroundColor: colors.accentSoft,
      borderRadius: colors.radiusMd,
      padding: 12,
      marginBottom: 14,
    },
    messageText: { color: colors.accentStrong, lineHeight: 20, fontWeight: '600' },
    currentCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    currentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    currentEyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    currentTitle: { color: colors.fg, fontSize: 20, fontWeight: '800', marginTop: 4 },
    currentCopy: { color: colors.muted, lineHeight: 20, marginTop: 6 },
    currentMeta: { color: colors.muted, marginTop: 6, fontSize: 13, fontWeight: '600' },
    currentProgress: { color: colors.muted, marginTop: 8, fontSize: 13, fontWeight: '700' },
    metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    metric: {
      flexGrow: 1,
      flexBasis: '22%',
      backgroundColor: colors.bg,
      borderRadius: 12,
      padding: 10,
      minWidth: 72,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricValue: { color: colors.fg, fontSize: 15, fontWeight: '800' },
    metricLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
    sectionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800', marginBottom: 14 },
    fieldLabel: { color: colors.fg, fontWeight: '800', marginBottom: 10, marginTop: 4 },
    trackList: { gap: 10, marginBottom: 18 },
    trackOption: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    trackOptionSelected: { borderColor: colors.accent, borderWidth: 2 },
    trackOptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    trackOptionTitle: { color: colors.fg, fontWeight: '800', fontSize: 16 },
    trackOptionDescription: { color: colors.muted, lineHeight: 18, fontSize: 13 },
    selectedPill: {
      alignSelf: 'flex-start',
      borderRadius: colors.radiusPill,
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    selectedPillText: { fontSize: 12, fontWeight: '800' },
    dayRow: { gap: 10, marginBottom: 18 },
    dayOption: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    dayOptionSelected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.accentSoft },
    dayOptionTitle: { color: colors.fg, fontWeight: '800', fontSize: 16 },
    dayOptionHint: { color: colors.accentStrong, fontWeight: '700', marginTop: 4, fontSize: 13 },
    dayOptionDescription: { color: colors.muted, lineHeight: 18, marginTop: 6, fontSize: 13 },
    startButton: {
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      padding: 16,
      alignItems: 'center',
      marginBottom: 8,
    },
    startButtonDisabled: { opacity: 0.7 },
    startButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.border, marginTop: 12 },
    progressFill: { height: '100%', borderRadius: 999 },
    refreshButton: { padding: 16, alignItems: 'center' },
    refreshText: { color: colors.accent, fontWeight: '700' },
  });
}
