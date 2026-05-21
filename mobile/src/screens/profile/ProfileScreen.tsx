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
import { preferenceLabel, useAppTheme } from '../../context/ThemeContext';
import { WEB_URL } from '../../config';
import type { AppThemeColors } from '../../lib/design';
import { formatLevel, formatTrack, getRankInfo } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { RecentActivitySection } from '../../components/profile/RecentActivitySection';
import type { CompletedCourseSummary } from '../../services/progress';
import { clearTokens } from '../../services/auth';
import { LearnerDashboard, fetchLearnerDashboard } from '../../services/progress';

export function ProfileScreen() {
  const router = useRouter();
  const { colors, preference, cyclePreference } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement du profil…</Text>
      </View>
    );
  }

  const { data, source } = dashboard;
  const displayName = data.user.displayName ?? 'Apprenant';
  const rank = getRankInfo(data.progress.points);
  const completedCourses = data.completedCourses ?? [];
  const recentActivity = data.recentActivity ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Mon profil</Text>
      <Text style={styles.title}>{displayName}</Text>

      <Pressable
        style={styles.themeCard}
        onPress={cyclePreference}
        accessibilityRole="button"
        accessibilityLabel={`Apparence : ${preferenceLabel(preference)}. Appuyer pour changer.`}
      >
        <Text style={styles.themeTitle}>Apparence</Text>
        <Text style={styles.themeValue}>{preferenceLabel(preference)}</Text>
        <Text style={styles.themeHint}>Clair, sombre ou suivre le système</Text>
      </Pressable>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo — connecte-toi pour synchroniser ta progression sur le web.
          </Text>
        </View>
      ) : null}

      {data.learningStreak ? (
        <View style={styles.streakCard}>
          <Text style={styles.streakEyebrow}>{'\u{1F525}'} Série d'apprentissage</Text>
          <Text style={styles.streakValue}>
            {data.learningStreak.currentDays} jour{data.learningStreak.currentDays > 1 ? 's' : ''} consécutif{data.learningStreak.currentDays > 1 ? 's' : ''}
          </Text>
          <Text style={styles.streakMeta}>
            Meilleure série : {data.learningStreak.longestDays} jour{data.learningStreak.longestDays > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <View style={[styles.heroCard, { backgroundColor: rank.gradient[0] }]}>
        <Text style={styles.heroEyebrow}>
          {rank.icon} Rang {rank.name}
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Points" value={String(data.progress.points)} styles={styles} />
          <Stat label="Niveau" value={formatLevel(data.progress.level)} styles={styles} />
        </View>
        <Text style={styles.heroMeta}>
          {data.progress.completedModules}/{data.progress.totalModules} unités · score moyen{' '}
          {data.progress.averageScore} %
        </Text>
      </View>

      <RecentActivitySection items={recentActivity} />

      <Text style={styles.sectionTitle}>Parcours terminés</Text>
      <Text style={styles.sectionHint}>
        {source === 'api'
          ? 'Tes victoires synchronisées depuis le tableau de bord'
          : 'Connecte-toi pour voir tes parcours validés'}
      </Text>

      {completedCourses.length > 0 ? (
        <View style={styles.completedList}>
          {completedCourses.map((course) => (
            <CompletedCourseRow key={course.slug} course={course} styles={styles} />
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

      <Text style={styles.sectionTitle}>Gamification</Text>
      <Text style={styles.sectionHint}>Badges, quêtes et sprint certification</Text>

      <Pressable style={styles.linkCard} onPress={() => router.push('/badges')}>
        <Text style={styles.linkTitle}>Mes badges</Text>
        <Text style={styles.linkHint}>Collection Apple, Jamf et Intune</Text>
        <Text style={styles.linkCta}>Voir les badges →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/sprint')}>
        <Text style={styles.linkTitle}>Sprint certification</Text>
        <Text style={styles.linkHint}>Préparation 7 ou 14 jours par piste</Text>
        <Text style={styles.linkCta}>Lancer un sprint →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/quests')}>
        <Text style={styles.linkTitle}>Quêtes hebdomadaires</Text>
        <Text style={styles.linkHint}>Défis de la semaine et récompenses bonus</Text>
        <Text style={styles.linkCta}>Voir les quêtes →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/leaderboard')}>
        <Text style={styles.linkTitle}>Classement</Text>
        <Text style={styles.linkHint}>Compare ta progression à la communauté</Text>
        <Text style={styles.linkCta}>Voir le classement →</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Sur le web</Text>
      <Text style={styles.sectionHint}>Profil complet et diagnostics</Text>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/profile')}>
        <Text style={styles.linkTitle}>Profil apprenant</Text>
        <Text style={styles.linkHint}>Parcours, sprint et statistiques détaillées</Text>
        <Text style={styles.linkCta}>Ouvrir sur le web →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/about')}>
        <Text style={styles.linkTitle}>À propos</Text>
        <Text style={styles.linkHint}>Mission, vision et trois piliers MDM Academy</Text>
        <Text style={styles.linkCta}>Ouvrir sur le web →</Text>
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

function CompletedCourseRow({
  course,
  styles,
}: {
  course: CompletedCourseSummary;
  styles: ReturnType<typeof createStyles>;
}) {
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

function Stat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
    eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
    title: { color: colors.fg, fontSize: 28, fontWeight: '800', marginBottom: 16 },
    themeCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    themeValue: { color: colors.accent, fontWeight: '800', marginTop: 6, fontSize: 15 },
    themeHint: { color: colors.muted, marginTop: 4, fontSize: 13 },
    streakCard: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    streakEyebrow: { color: colors.demoBannerText, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    streakValue: { color: colors.fg, fontSize: 22, fontWeight: '800', marginTop: 6 },
    streakMeta: { color: colors.muted, marginTop: 4, fontSize: 13, fontWeight: '600' },
    demoBanner: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    demoText: { color: colors.demoBannerText, lineHeight: 20 },
    heroCard: { borderRadius: 24, padding: 20, marginBottom: 24 },
    heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 12 },
    statsRow: { flexDirection: 'row', gap: 12 },
    stat: { flex: 1 },
    statValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.82)', marginTop: 4 },
    heroMeta: { color: 'rgba(255,255,255,0.78)', marginTop: 12, lineHeight: 18, fontSize: 13 },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
    sectionHint: { color: colors.muted, marginTop: 2, marginBottom: 12, fontSize: 13 },
    completedList: { gap: 10, marginBottom: 24 },
    completedCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    completedMeta: { color: colors.muted, marginTop: 6, fontSize: 14 },
    completedSlug: { color: colors.muted, marginTop: 4, fontSize: 12, fontWeight: '600', opacity: 0.75 },
    emptyCompletedCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyCompletedTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    emptyCompletedText: { color: colors.muted, marginTop: 8, lineHeight: 20, fontSize: 14 },
    catalogLink: { marginTop: 12 },
    catalogLinkText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
    linkCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    linkHint: { color: colors.muted, marginTop: 4, lineHeight: 20, fontSize: 14 },
    linkCta: { color: colors.accent, fontWeight: '800', marginTop: 10, fontSize: 15 },
    refreshButton: { padding: 16, alignItems: 'center' },
    refreshText: { color: colors.accent, fontWeight: '700' },
    signOutButton: {
      marginTop: 8,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.bgSoft,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    signOutText: { color: '#f87171', fontWeight: '800' },
  });
}
