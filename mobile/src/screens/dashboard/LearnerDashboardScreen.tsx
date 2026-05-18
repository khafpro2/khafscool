import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { clearTokens } from '../../services/auth';
import {
  CourseSummary,
  LearnerDashboard,
  fetchLearnerDashboard,
} from '../../services/progress';
import {
  CertificationSprintSummary,
  CertificationSprintTrack,
  fetchCurrentCertificationSprint,
  startCertificationSprint,
} from '../../services/sprint';

interface LearnerDashboardScreenProps {
  onSignOut: () => void;
}

const certificationSprintTracks: CertificationSprintTrack[] = ['APPLE', 'JAMF', 'INTUNE'];

const trackLabels: Record<string, string> = {
  APPLE: 'Apple Device Support',
  JAMF: 'Jamf Pro',
  INTUNE: 'Microsoft Intune',
};

const badgeLabels: Record<string, string> = {
  'apple-mdm-foundation': 'Fondamentaux Apple MDM',
  'jamf-engineer': 'Ingénieur Jamf',
  'intune-professional': 'Professionnel Intune',
};

type SprintMessage = {
  text: string;
  tone: 'success' | 'error' | 'info';
};

export function LearnerDashboardScreen({ onSignOut }: LearnerDashboardScreenProps) {
  const [dashboard, setDashboard] = useState<LearnerDashboard | null>(null);
  const [sprint, setSprint] = useState<CertificationSprintSummary | null>(null);
  const [sprintSource, setSprintSource] = useState<'api' | 'demo'>('api');
  const [startingTrack, setStartingTrack] = useState<CertificationSprintTrack | null>(null);
  const [sprintMessage, setSprintMessage] = useState<SprintMessage | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    const [nextDashboard, nextSprint] = await Promise.all([
      fetchLearnerDashboard(),
      fetchCurrentCertificationSprint(),
    ]);
    setDashboard(nextDashboard);
    setSprint(nextSprint.data);
    setSprintSource(nextSprint.source);
    setSprintMessage(
      nextSprint.source === 'demo'
        ? { text: 'Mode démo : connectez-vous pour enregistrer un vrai sprint.', tone: 'info' }
        : null
    );
    setLoading(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const nextCourse = useMemo(() => {
    return dashboard?.data.courses.find((course) => course.nextModule) ?? dashboard?.data.courses[0] ?? null;
  }, [dashboard]);

  async function handleSignOut() {
    await clearTokens();
    onSignOut();
  }

  async function handleStartSprint(track: CertificationSprintTrack) {
    setStartingTrack(track);
    setSprintMessage(null);

    try {
      const nextSprint = await startCertificationSprint({ track, days: 7 });
      setSprint(nextSprint.data);
      setSprintSource(nextSprint.source);
      setSprintMessage(
        nextSprint.source === 'demo'
          ? { text: `Sprint ${formatTrack(track)} démarré en démo locale.`, tone: 'info' }
          : { text: `Sprint ${formatTrack(track)} démarré pour 7 jours.`, tone: 'success' }
      );
    } catch {
      setSprintMessage({
        text: `Impossible de démarrer le sprint ${formatTrack(track)}. Réessayez dans un instant.`,
        tone: 'error',
      });
    } finally {
      setStartingTrack(null);
    }
  }

  if (loading || !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de votre progression…</Text>
      </View>
    );
  }

  const { data, source } = dashboard;
  const displayName = data.user.displayName ?? 'Apprenant';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Tableau de bord</Text>
          <Text style={styles.title}>Bonjour {displayName}</Text>
        </View>
        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Déconnexion</Text>
        </Pressable>
      </View>

      {source === 'demo' || sprintSource === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>Mode démo : l’API est indisponible ou aucun token n’est actif.</Text>
        </View>
      ) : null}

      <View style={styles.heroCard}>
        <Text style={styles.cardLabel}>Progression globale</Text>
        <View style={styles.heroStats}>
          <Stat label="Points" value={String(data.progress.points)} />
          <Stat label="Niveau" value={formatLevel(data.progress.level)} />
        </View>
        <ProgressBar progress={data.progress.progressPercent} />
        <Text style={styles.progressCopy}>
          {data.progress.completedModules}/{data.progress.totalModules} modules terminés · score moyen{' '}
          {data.progress.averageScore} %
        </Text>
      </View>

      <SprintCard
        sprint={sprint}
        startingTrack={startingTrack}
        message={sprintMessage}
        onStart={handleStartSprint}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
      </View>
      <View style={styles.badgeRow}>
        {data.badges.length > 0 ? (
          data.badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{formatBadge(badge)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Terminez un premier module pour débloquer un badge.</Text>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cours</Text>
      </View>
      {data.courses.map((course) => (
        <CourseProgressCard key={course.id} course={course} />
      ))}

      <View style={styles.ctaCard}>
        <Text style={styles.cardLabel}>Prochaine étape</Text>
        <Text style={styles.ctaTitle}>{nextCourse?.nextModule?.title ?? 'Découvrir le prochain module'}</Text>
        <Text style={styles.ctaText}>
          Continuez votre parcours pour progresser vers la prochaine certification.
        </Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={[styles.ctaButton, styles.primaryButton]}
            onPress={() => showNextModule(nextCourse)}
          >
            <Text style={styles.primaryButtonText}>Continuer</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={loadDashboard} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir la progression</Text>
      </Pressable>
    </ScrollView>
  );
}

function SprintCard({
  sprint,
  startingTrack,
  message,
  onStart,
}: {
  sprint: CertificationSprintSummary | null;
  startingTrack: CertificationSprintTrack | null;
  message: SprintMessage | null;
  onStart: (track: CertificationSprintTrack) => void;
}) {
  const sprintStatus = sprint ? formatSprintStatus(sprint) : null;
  const isStartingAnySprint = startingTrack !== null;

  return (
    <View style={styles.sprintCard}>
      <View style={styles.sprintHeader}>
        <View style={styles.sprintText}>
          <Text style={styles.cardLabel}>Certification Sprint</Text>
          <Text style={styles.sprintTitle}>
            {sprint ? `Sprint ${formatTrack(sprint.track)} en cours` : 'Lancez un sprint 7 jours'}
          </Text>
        </View>
        <Text style={styles.sprintDuration}>7 jours</Text>
      </View>

      {sprint ? (
        <View style={styles.sprintProgress}>
          <View style={styles.sprintStatusRow}>
            <Text
              style={[
                styles.sprintStatusPill,
                sprint.completed
                  ? styles.sprintStatusCompleted
                  : sprint.expired
                    ? styles.sprintStatusExpired
                    : styles.sprintStatusActive,
              ]}
            >
              {sprintStatus}
            </Text>
            <Text style={styles.sprintDeadline}>Échéance {formatSprintDate(sprint.endsAt)}</Text>
          </View>
          <ProgressBar progress={sprint.progressPercent} />
          <Text style={styles.sprintMeta}>
            {formatTrack(sprint.track)} · {sprint.progress}/{sprint.target} modules ·{' '}
            {sprint.progressPercent} % complété
          </Text>
          <View style={styles.sprintMetrics}>
            <SprintMetric label="Parcours" value={formatTrack(sprint.track)} />
            <SprintMetric label="Objectif" value={`${sprint.progress}/${sprint.target}`} />
            <SprintMetric label="Restants" value={String(sprint.remainingModules)} />
          </View>
        </View>
      ) : (
        <Text style={styles.sprintMeta}>
          Choisissez un objectif Apple, Jamf ou Intune pour structurer votre préparation.
        </Text>
      )}

      {message ? (
        <Text
          style={[
            styles.sprintMessage,
            message.tone === 'success'
              ? styles.sprintMessageSuccess
              : message.tone === 'error'
                ? styles.sprintMessageError
                : styles.sprintMessageInfo,
          ]}
        >
          {message.text}
        </Text>
      ) : null}

      <View style={styles.trackButtons}>
        {certificationSprintTracks.map((track) => {
          const isStarting = startingTrack === track;
          return (
            <Pressable
              key={track}
              disabled={isStartingAnySprint}
              onPress={() => onStart(track)}
              style={[styles.trackButton, isStartingAnySprint ? styles.trackButtonDisabled : null]}
            >
              <View style={styles.trackButtonContent}>
                {isStarting ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
                <Text style={styles.trackButtonText}>
                  {isStarting ? 'Démarrage…' : formatTrack(track)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SprintMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sprintMetric}>
      <Text style={styles.sprintMetricValue}>{value}</Text>
      <Text style={styles.sprintMetricLabel}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CourseProgressCard({ course }: { course: CourseSummary }) {
  const progress = course.progressPercent ?? 0;

  return (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <View style={styles.courseText}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseMeta}>
            {formatTrack(course.track)} · {course.completedModules ?? 0}/{course.totalModules ?? 0} modules
          </Text>
        </View>
        <Text style={styles.coursePercent}>{progress} %</Text>
      </View>
      <ProgressBar progress={progress} />
      <Text style={styles.nextModule}>
        {course.nextModule ? `À suivre : ${course.nextModule.title}` : 'Parcours terminé'}
      </Text>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress}%` }]} />
    </View>
  );
}

function showNextModule(course: CourseSummary | null) {
  Alert.alert(
    'Prochain module',
    course?.nextModule
      ? `Continuez avec « ${course.nextModule.title} » dans le parcours ${course.title}.`
      : 'Aucun module suivant disponible pour le moment.'
  );
}

function formatLevel(level: string) {
  return level
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatBadge(badge: string) {
  return (
    badgeLabels[badge] ??
    badge
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function formatTrack(track: CertificationSprintTrack | string) {
  return trackLabels[track] ?? track;
}

function formatSprintStatus(sprint: CertificationSprintSummary) {
  if (sprint.completed) return 'Terminé';
  if (sprint.expired) return 'Expiré';
  return 'Actif';
}

function formatSprintDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'à confirmer';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' },
  loadingText: { marginTop: 12, color: '#6E6E73', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: '#007AFF', fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  title: { color: '#1D1D1F', fontSize: 28, fontWeight: '800', maxWidth: 220 },
  signOutButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFFFFF' },
  signOutText: { color: '#6E6E73', fontWeight: '600' },
  demoBanner: { backgroundColor: '#FFF7E6', borderRadius: 14, padding: 12, marginBottom: 14 },
  demoText: { color: '#8A5A00', lineHeight: 20 },
  heroCard: { backgroundColor: '#1D1D1F', borderRadius: 24, padding: 20, marginBottom: 24 },
  cardLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  heroStats: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  stat: { flex: 1 },
  statValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#BDBDC2', marginTop: 4 },
  progressTrack: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 999 },
  progressCopy: { color: '#D1D1D6', marginTop: 12, lineHeight: 20 },
  sprintCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 24 },
  sprintHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  sprintText: { flex: 1 },
  sprintTitle: { color: '#1D1D1F', fontSize: 21, fontWeight: '800' },
  sprintDuration: {
    backgroundColor: '#EAF3FF',
    borderRadius: 999,
    color: '#0066CC',
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sprintProgress: { marginTop: 14 },
  sprintStatusRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  sprintStatusPill: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  sprintStatusActive: { backgroundColor: '#EAF3FF', color: '#0066CC' },
  sprintStatusCompleted: { backgroundColor: '#E9F8EE', color: '#1F7A3A' },
  sprintStatusExpired: { backgroundColor: '#FFECEC', color: '#B3261E' },
  sprintDeadline: { color: '#6E6E73', fontWeight: '700' },
  sprintMeta: { color: '#6E6E73', lineHeight: 20, marginTop: 10 },
  sprintMetrics: { flexDirection: 'row', gap: 10, marginTop: 14 },
  sprintMetric: { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 14, padding: 12 },
  sprintMetricValue: { color: '#1D1D1F', fontSize: 16, fontWeight: '800' },
  sprintMetricLabel: { color: '#6E6E73', fontSize: 12, fontWeight: '700', marginTop: 3 },
  sprintMessage: { borderRadius: 14, fontWeight: '700', lineHeight: 20, marginTop: 10, padding: 12 },
  sprintMessageSuccess: { backgroundColor: '#E9F8EE', color: '#1F7A3A' },
  sprintMessageError: { backgroundColor: '#FFECEC', color: '#B3261E' },
  sprintMessageInfo: { backgroundColor: '#EAF3FF', color: '#0066CC' },
  trackButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  trackButton: {
    backgroundColor: '#1D1D1F',
    borderRadius: 14,
    minWidth: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonDisabled: { opacity: 0.6 },
  trackButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackButtonText: { color: '#FFFFFF', fontWeight: '800' },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { color: '#1D1D1F', fontSize: 20, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  badge: { backgroundColor: '#EAF3FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: '#0066CC', fontWeight: '700' },
  emptyText: { color: '#6E6E73', lineHeight: 20 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12 },
  courseHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  courseText: { flex: 1 },
  courseTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800' },
  courseMeta: { color: '#6E6E73', marginTop: 4, marginBottom: 12 },
  coursePercent: { color: '#007AFF', fontSize: 18, fontWeight: '800' },
  nextModule: { color: '#6E6E73', marginTop: 12, lineHeight: 20 },
  ctaCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginTop: 12 },
  ctaTitle: { color: '#1D1D1F', fontSize: 21, fontWeight: '800', marginBottom: 8 },
  ctaText: { color: '#6E6E73', lineHeight: 20, marginBottom: 14 },
  ctaButtons: { flexDirection: 'row', gap: 10 },
  ctaButton: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: '#007AFF' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#007AFF', fontWeight: '700' },
});
