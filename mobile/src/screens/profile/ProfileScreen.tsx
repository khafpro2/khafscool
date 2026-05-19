import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WEB_URL } from '../../config';
import { formatLevel, formatTrack, getRankInfo } from '../../lib/design';
import type { CompletedCourseSummary } from '../../services/progress';
import { clearTokens } from '../../services/auth';
import { LearnerDashboard, fetchLearnerDashboard } from '../../services/progress';

export function ProfileScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<LearnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    setLoading(true);
    const result = await fetchLearnerDashboard();
    setDashboard(result);
    setLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function openWebPath(path: string) {
    void Linking.openURL(`${WEB_URL}${path}`);
  }

  async function handleSignOut() {
    await clearTokens();
    router.replace('/');
  }

  if (loading || !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0070D2" />
        <Text style={styles.loadingText}>Chargement du profil…</Text>
      </View>
    );
  }

  const { data, source } = dashboard;
  const displayName = data.user.displayName ?? 'Trailblazer';
  const rank = getRankInfo(data.progress.points);
  const completedCourses = data.completedCourses ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Mon profil</Text>
      <Text style={styles.title}>{displayName}</Text>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo — connecte-toi pour synchroniser ta progression sur le web.
          </Text>
        </View>
      ) : null}

      {data.learningStreak ? (
        <View style={styles.streakCard}>
          <Text style={styles.streakEyebrow}>{'\u{1F525}'} Série Trailblazer</Text>
          <Text style={styles.streakValue}>
            {data.learningStreak.currentDays} jour{data.learningStreak.currentDays > 1 ? 's' : ''} consécutif{data.learningStreak.currentDays > 1 ? 's' : ''}
          </Text>
          <Text style={styles.streakMeta}>
            Record {data.learningStreak.longestDays} jour{data.learningStreak.longestDays > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <View style={[styles.heroCard, { backgroundColor: rank.gradient[0] }]}>
        <Text style={styles.heroEyebrow}>
          {rank.icon} Rang {rank.name}
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Points" value={String(data.progress.points)} />
          <Stat label="Niveau" value={formatLevel(data.progress.level)} />
        </View>
        <Text style={styles.heroMeta}>
          {data.progress.completedModules}/{data.progress.totalModules} modules · score moyen{' '}
          {data.progress.averageScore} %
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Parcours terminés</Text>
      <Text style={styles.sectionHint}>
        {source === 'api'
          ? 'Tes victoires synchronisées depuis le tableau de bord'
          : 'Connecte-toi pour voir tes parcours validés'}
      </Text>

      {completedCourses.length > 0 ? (
        <View style={styles.completedList}>
          {completedCourses.map((course) => (
            <CompletedCourseRow key={course.slug} course={course} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCompletedCard}>
          <Text style={styles.emptyCompletedTitle}>Aucun parcours terminé pour l’instant</Text>
          <Text style={styles.emptyCompletedText}>
            Valide toutes les unités d’un parcours pour l’ajouter ici et débloquer ton prochain badge.
          </Text>
          <Pressable style={styles.catalogLink} onPress={() => router.push('/(tabs)/courses')}>
            <Text style={styles.catalogLinkText}>Explorer le catalogue →</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Sur le web</Text>
      <Text style={styles.sectionHint}>Profil complet, badges et quêtes hebdomadaires</Text>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/profile')}>
        <Text style={styles.linkTitle}>Profil Trailblazer</Text>
        <Text style={styles.linkHint}>Parcours, sprint et statistiques détaillées</Text>
        <Text style={styles.linkCta}>Ouvrir sur le web →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/badges')}>
        <Text style={styles.linkTitle}>Mes badges</Text>
        <Text style={styles.linkHint}>Collection Apple, Jamf et Intune</Text>
        <Text style={styles.linkCta}>Voir les badges →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/quests')}>
        <Text style={styles.linkTitle}>Quêtes hebdomadaires</Text>
        <Text style={styles.linkHint}>Défis de la semaine et récompenses bonus</Text>
        <Text style={styles.linkCta}>Voir les quêtes →</Text>
      </Pressable>

      <Pressable onPress={loadProfile} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le profil</Text>
      </Pressable>

      <Pressable onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

function CompletedCourseRow({ course }: { course: CompletedCourseSummary }) {
  return (
    <View style={styles.completedCard}>
      <Text style={styles.completedTitle}>{course.title}</Text>
      <Text style={styles.completedMeta}>
        {formatTrack(course.track)} · {formatCompletedDate(course.completedAt)}
      </Text>
      <Text style={styles.completedSlug}>{course.slug}</Text>
    </View>
  );
}

function formatCompletedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date à confirmer';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' },
  loadingText: { marginTop: 12, color: '#6E6E73', fontSize: 15 },
  eyebrow: { color: '#0070D2', fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  title: { color: '#1D1D1F', fontSize: 28, fontWeight: '800', marginBottom: 16 },
  streakCard: {
    backgroundColor: '#FFF4E8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5B87A',
  },
  streakEyebrow: { color: '#B45309', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  streakValue: { color: '#1D1D1F', fontSize: 22, fontWeight: '800', marginTop: 6 },
  streakMeta: { color: '#6E6E73', marginTop: 4, fontSize: 13, fontWeight: '600' },
  demoBanner: { backgroundColor: '#FFF7E6', borderRadius: 14, padding: 12, marginBottom: 16 },
  demoText: { color: '#8A5A00', lineHeight: 20 },
  heroCard: { borderRadius: 24, padding: 20, marginBottom: 24 },
  heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1 },
  statValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.82)', marginTop: 4 },
  heroMeta: { color: 'rgba(255,255,255,0.78)', marginTop: 12, lineHeight: 18, fontSize: 13 },
  sectionTitle: { color: '#1D1D1F', fontSize: 20, fontWeight: '800' },
  sectionHint: { color: '#6E6E73', marginTop: 2, marginBottom: 12, fontSize: 13 },
  completedList: { gap: 10, marginBottom: 24 },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
  },
  completedTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800' },
  completedMeta: { color: '#6E6E73', marginTop: 6, fontSize: 14 },
  completedSlug: { color: '#AEAEB2', marginTop: 4, fontSize: 12, fontWeight: '600' },
  emptyCompletedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  emptyCompletedTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800' },
  emptyCompletedText: { color: '#6E6E73', marginTop: 8, lineHeight: 20, fontSize: 14 },
  catalogLink: { marginTop: 12 },
  catalogLinkText: { color: '#0070D2', fontWeight: '800', fontSize: 15 },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  linkTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800' },
  linkHint: { color: '#6E6E73', marginTop: 4, lineHeight: 20, fontSize: 14 },
  linkCta: { color: '#0070D2', fontWeight: '800', marginTop: 10, fontSize: 15 },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#0070D2', fontWeight: '700' },
  signOutButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  signOutText: { color: '#B3261E', fontWeight: '800' },
});
