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

interface LearnerDashboardScreenProps {
  onSignOut: () => void;
}

export function LearnerDashboardScreen({ onSignOut }: LearnerDashboardScreenProps) {
  const [dashboard, setDashboard] = useState<LearnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    const nextDashboard = await fetchLearnerDashboard();
    setDashboard(nextDashboard);
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

      {source === 'demo' ? (
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
          Continuez votre parcours ou entraînez-vous à qualifier un ticket ServiceNow.
        </Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={[styles.ctaButton, styles.primaryButton]}
            onPress={() => showNextModule(nextCourse)}
          >
            <Text style={styles.primaryButtonText}>Continuer</Text>
          </Pressable>
          <Pressable style={[styles.ctaButton, styles.secondaryButton]} onPress={showServiceNowCta}>
            <Text style={styles.secondaryButtonText}>ServiceNow</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={loadDashboard} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir la progression</Text>
      </Pressable>
    </ScrollView>
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

function showServiceNowCta() {
  Alert.alert(
    'ServiceNow',
    'Ouvrez le module ServiceNow sur le web pour vous entraîner à qualifier et prioriser des tickets.'
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
  return badge
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatTrack(track: string) {
  const labels: Record<string, string> = {
    APPLE: 'Apple',
    INTUNE: 'Intune',
    JAMF: 'Jamf',
    SERVICENOW: 'ServiceNow',
  };
  return labels[track] ?? track;
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
  secondaryButton: { backgroundColor: '#EAF3FF' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButtonText: { color: '#0066CC', fontWeight: '800' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#007AFF', fontWeight: '700' },
});
