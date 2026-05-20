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
import { formatTrack, getTrackVisual, theme } from '../../lib/design';
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
    title: 'Sprint intensif — 7 jours',
    description: 'Rythme soutenu pour réviser les unités clés avant une certification proche.',
    modulesHint: '4 unités ciblées',
  },
  14: {
    title: 'Sprint étendu — 14 jours',
    description: 'Progression plus souple avec marge pour consolider chaque piste.',
    modulesHint: '4 unités + révisions',
  },
};

export function SprintScreen() {
  const router = useRouter();
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
        <ActivityIndicator color={theme.accent} />
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
          Choisis Apple, Jamf ou Intune, puis lance un sprint de 7 ou 14 jours pour structurer ta révision.
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

      <CurrentSprintCard sprint={sprint} />

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

function CurrentSprintCard({ sprint }: { sprint: CertificationSprintSummary | null }) {
  if (!sprint) {
    return (
      <View style={styles.currentCard}>
        <Text style={styles.currentEyebrow}>Sprint courant</Text>
        <Text style={styles.currentTitle}>Aucun sprint actif</Text>
        <Text style={styles.currentCopy}>
          Lance un sprint ci-dessous pour transformer tes unités en plan de révision mesurable.
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
        fillColor={sprint.completed ? theme.success : theme.accent}
      />
      <Text style={styles.currentProgress}>
        {sprint.progress}/{sprint.target} unités · {sprint.progressPercent} % complété
      </Text>
      <View style={styles.metricsRow}>
        <SprintMetric label="Restants" value={String(sprint.remainingModules)} />
        <SprintMetric label="Jours restants" value={String(daysRemaining)} />
        <SprintMetric label="Parcours" value={formatTrack(sprint.track)} />
        <SprintMetric label="Statut" value={statusLabel} />
      </View>
    </View>
  );
}

function SprintMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ progress, fillColor }: { progress: number; fillColor: string }) {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  loadingText: { marginTop: 12, color: theme.muted, fontSize: 15 },
  backLink: { marginBottom: 12 },
  backLinkText: { color: theme.accent, fontWeight: '700', fontSize: 15 },
  heroCard: { borderRadius: theme.radiusLg, padding: 20, marginBottom: 16 },
  heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heroCopy: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
  demoBanner: {
    backgroundColor: theme.demoBannerBg,
    borderRadius: theme.radiusLg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.demoBannerBorder,
  },
  demoText: { color: theme.demoBannerText, lineHeight: 20, fontWeight: '600' },
  messageBanner: {
    backgroundColor: theme.accentSoft,
    borderRadius: theme.radiusMd,
    padding: 12,
    marginBottom: 14,
  },
  messageText: { color: theme.accentStrong, lineHeight: 20, fontWeight: '600' },
  currentCard: {
    backgroundColor: theme.bgSoft,
    borderRadius: theme.radiusLg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.accentSoft,
  },
  currentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  currentEyebrow: { color: theme.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  currentTitle: { color: theme.fg, fontSize: 20, fontWeight: '800', marginTop: 4 },
  currentCopy: { color: theme.muted, lineHeight: 20, marginTop: 6 },
  currentMeta: { color: theme.muted, marginTop: 6, fontSize: 13, fontWeight: '600' },
  currentProgress: { color: theme.muted, marginTop: 8, fontSize: 13, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metric: {
    flexGrow: 1,
    flexBasis: '22%',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 10,
    minWidth: 72,
  },
  metricValue: { color: theme.fg, fontSize: 15, fontWeight: '800' },
  metricLabel: { color: theme.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  sectionEyebrow: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sectionTitle: { color: theme.fg, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  fieldLabel: { color: theme.fg, fontWeight: '800', marginBottom: 10, marginTop: 4 },
  trackList: { gap: 10, marginBottom: 18 },
  trackOption: {
    backgroundColor: theme.bgSoft,
    borderRadius: theme.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.accentSoft,
  },
  trackOptionSelected: { borderColor: theme.accent, borderWidth: 2 },
  trackOptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  trackOptionTitle: { color: theme.fg, fontWeight: '800', fontSize: 16 },
  trackOptionDescription: { color: theme.muted, lineHeight: 18, fontSize: 13 },
  selectedPill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radiusPill,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedPillText: { fontSize: 12, fontWeight: '800' },
  dayRow: { gap: 10, marginBottom: 18 },
  dayOption: {
    backgroundColor: theme.bgSoft,
    borderRadius: theme.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.accentSoft,
  },
  dayOptionSelected: { borderColor: theme.accent, borderWidth: 2, backgroundColor: theme.accentSoft },
  dayOptionTitle: { color: theme.fg, fontWeight: '800', fontSize: 16 },
  dayOptionHint: { color: theme.accentStrong, fontWeight: '700', marginTop: 4, fontSize: 13 },
  dayOptionDescription: { color: theme.muted, lineHeight: 18, marginTop: 6, fontSize: 13 },
  startButton: {
    backgroundColor: theme.accent,
    borderRadius: theme.radiusMd,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  startButtonDisabled: { opacity: 0.7 },
  startButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E5E5EA', marginTop: 12 },
  progressFill: { height: '100%', borderRadius: 999 },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: theme.accent, fontWeight: '700' },
});
