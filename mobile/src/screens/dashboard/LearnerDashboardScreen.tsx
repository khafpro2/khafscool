import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { BrandIcon } from '../../components/BrandIcon';
import { AlmostCompleteBanner } from '../../components/dashboard/AlmostCompleteBanner';
import { ContinueLearningSection } from '../../components/home/ContinueLearningSection';
import { HomeEngagementSection } from '../../components/home/HomeEngagementSection';
import { MdmTracksSection } from '../../components/MdmTracksSection';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatLevel, formatTrack, getBadgeVisual, getRankInfo } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { toastQuestsCompleted } from '../../lib/gamification-toasts';
import { detectNewlyCompletedQuests } from '../../lib/quest-feedback';
import { hasPendingWeeklyQuest, writeQuestNavCache } from '../../lib/quest-nav-badge';
import {
  buildPointsRankNavSnapshot,
  formatLeaderboardRankLabel,
  writePointsRankNavCache,
} from '../../lib/points-rank-nav-badge';
import { writeStreakNavCache } from '../../lib/streak-nav-badge';
import { usePointsRankNav } from '../../hooks/usePointsRankNav';
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
import { fetchLeaderboard } from '../../services/gamification';

interface LearnerDashboardScreenProps {
  onSignOut: () => void;
}

const certificationSprintTracks: CertificationSprintTrack[] = ['APPLE', 'JAMF', 'INTUNE'];

type SprintMessage = {
  text: string;
  tone: 'success' | 'error' | 'info';
};

export function LearnerDashboardScreen({ onSignOut }: LearnerDashboardScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const pointsRankNav = usePointsRankNav();
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
    const newlyCompleted = detectNewlyCompletedQuests(
      nextDashboard.data.quests.map((quest) => ({
        ...quest,
        questKey: quest.id,
        completed: quest.target > 0 && quest.progress >= quest.target,
      }))
    );
    if (newlyCompleted.length > 0) {
      toastQuestsCompleted(newlyCompleted);
    }
    writeQuestNavCache(
      hasPendingWeeklyQuest(
        nextDashboard.data.quests.map((quest) => ({
          ...quest,
          questKey: quest.id,
          completed: quest.target > 0 && quest.progress >= quest.target,
        }))
      )
    );
    writeStreakNavCache(nextDashboard.data.learningStreak);
    if (nextDashboard.source === 'api') {
      const leaderboard = await fetchLeaderboard();
      writePointsRankNavCache(
        buildPointsRankNavSnapshot(
          nextDashboard.data.progress.points,
          leaderboard.data.currentUserRank
        )
      );
    }
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

  const activeCourses = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.data.courses.filter(
      (course) => (course.progressPercent ?? 0) < 100 || course.nextModule
    );
  }, [dashboard]);

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
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement de votre progression…</Text>
      </View>
    );
  }

  const { data, source } = dashboard;
  const displayName = data.user.displayName ?? 'Apprenant';
  const rank = getRankInfo(data.progress.points);
  const previousFloor = rank.minPoints;
  const ceiling = rank.nextPoints ?? Math.max(previousFloor + 100, data.progress.points + 100);
  const span = Math.max(1, ceiling - previousFloor);
  const progressInRank = Math.max(0, Math.min(span, data.progress.points - previousFloor));
  const rankPercent = Math.round((progressInRank / span) * 100);
  const remainingPoints = rank.nextPoints != null ? Math.max(0, rank.nextPoints - data.progress.points) : 0;
  const primaryCtaLabel = nextCourse?.nextModule ? 'Continuer le parcours' : 'Commencer gratuitement';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Espace apprenant</Text>
          <Text style={styles.title}>Bonjour {displayName}</Text>
          {source === 'api' && pointsRankNav ? (
            <View style={styles.headerSubtitleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${pointsRankNav.points} points, rang ${pointsRankNav.rankName}`}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.headerSubtitle}>
                  {pointsRankNav.points} pts · {pointsRankNav.rankName}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Classement ${formatLeaderboardRankLabel(pointsRankNav.leaderboardRank)}`}
                onPress={() => router.push('/leaderboard')}
              >
                <Text style={styles.headerSubtitleRank}>
                  {formatLeaderboardRankLabel(pointsRankNav.leaderboardRank)}
                </Text>
              </Pressable>
            </View>
          ) : null}
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

      <AlmostCompleteBanner courses={data.courses} />

      <ContinueLearningSection courses={data.courses} />

      <MdmTracksSection courses={data.courses} />

      <View style={[styles.heroCard, { backgroundColor: rank.gradient[0] }]}>
        <Text style={styles.heroEyebrow}>
          {rank.icon} Rang MDM · {rank.name}
        </Text>
        <View style={styles.heroStats}>
          <Stat label="Points" value={String(data.progress.points)} styles={styles} />
          <Stat label="Niveau" value={formatLevel(data.progress.level)} styles={styles} />
        </View>
        <ProgressBar
          progress={rankPercent}
          fillColor="#FFCE5B"
          trackColor="rgba(255,255,255,0.22)"
          styles={styles}
        />
        <Text style={styles.progressCopy}>
          {rank.nextName
            ? `${remainingPoints} pts pour le rang ${rank.nextName}`
            : 'Rang maximal atteint — bravo Champion·ne !'}
        </Text>
        <Text style={styles.progressMeta}>
          {data.progress.completedModules}/{data.progress.totalModules} unités · score moyen{' '}
          {data.progress.averageScore} %
        </Text>
      </View>

      <HomeEngagementSection quests={data.quests} sprint={sprint} />

      <View style={styles.quickActions}>
        <Pressable style={[styles.quickAction, styles.quickActionQuests]} onPress={() => router.push('/quests')}>
          <Text style={styles.quickActionIcon}>{'\u{1F3AF}'}</Text>
          <Text style={styles.quickActionTitle}>Quêtes hebdo</Text>
          <Text style={styles.quickActionHint}>Défis de la semaine</Text>
        </Pressable>
        <Pressable
          style={[styles.quickAction, styles.quickActionLeaderboard]}
          onPress={() => router.push('/leaderboard')}
        >
          <Text style={styles.quickActionIcon}>{'\u{1F3C6}'}</Text>
          <Text style={styles.quickActionTitle}>Classement</Text>
          <Text style={styles.quickActionHint}>Top communauté</Text>
        </Pressable>
      </View>

      <View style={styles.quickActions}>
        <Pressable style={[styles.quickAction, styles.quickActionBadges]} onPress={() => router.push('/badges')}>
          <Text style={styles.quickActionIcon}>{'\u{1F3C5}'}</Text>
          <Text style={styles.quickActionTitle}>Mes badges</Text>
          <Text style={styles.quickActionHint}>Collection Apple · Jamf · Intune</Text>
        </Pressable>
        <Pressable style={[styles.quickAction, styles.quickActionSprint]} onPress={() => router.push('/sprint')}>
          <Text style={styles.quickActionIcon}>{'\u{26A1}'}</Text>
          <Text style={styles.quickActionTitle}>Sprint certif</Text>
          <Text style={styles.quickActionHint}>7 ou 14 jours</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Parcours en cours</Text>
        <Text style={styles.sectionHint}>Reprends là où tu t’es arrêté</Text>
      </View>
      {activeCourses.length > 0 ? (
        activeCourses.map((course) => (
          <CourseProgressCard
            key={course.id}
            course={course}
            styles={styles}
            onPress={() => router.push(`/course/${course.slug}`)}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>Aucun parcours actif. Explore le catalogue pour commencer.</Text>
      )}
      <Pressable style={styles.catalogButton} onPress={() => router.push('/(tabs)/courses')}>
        <Text style={styles.catalogButtonText}>Voir tous les parcours →</Text>
      </Pressable>

      <SprintCard
        sprint={sprint}
        startingTrack={startingTrack}
        message={sprintMessage}
        styles={styles}
        colors={colors}
        onStart={handleStartSprint}
        onOpenSprint={() => router.push('/sprint')}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quêtes de la semaine</Text>
      </View>
      {data.quests.length > 0 ? (
        data.quests.map((quest) => {
          const target = Math.max(1, quest.target);
          const questPercent = Math.min(100, Math.round((quest.progress / target) * 100));
          return (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questLabel}>{quest.label}</Text>
                <Text style={styles.questCount}>
                  {quest.progress}/{quest.target}
                </Text>
              </View>
              <ProgressBar progress={questPercent} fillColor={colors.accent} styles={styles} />
            </View>
          );
        })
      ) : (
        <Text style={styles.emptyText}>
          Aucune quête active. Termine une unité ou démarre un sprint pour garder le rythme.
        </Text>
      )}
      <Pressable style={styles.linkButton} onPress={() => router.push('/quests')}>
        <Text style={styles.linkButtonText}>Voir les quêtes →</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
      </View>
      <View style={styles.badgeRow}>
        {data.badges.length > 0 ? (
          data.badges.map((badge) => {
            const visual = getBadgeVisual(badge);
            return (
              <View key={badge} style={[styles.badge, { backgroundColor: visual.bg }]}>
                {visual.brand ? (
                  <BrandIcon brand={visual.brand} size="sm" />
                ) : (
                  <Text style={styles.badgeIcon}>{visual.icon}</Text>
                )}
                <Text style={[styles.badgeText, { color: visual.color }]}>{visual.label}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Terminez une première unité pour débloquer un badge.</Text>
        )}
      </View>
      <Pressable style={styles.linkButton} onPress={() => router.push('/badges')}>
        <Text style={styles.linkButtonText}>Voir toute la collection →</Text>
      </Pressable>

      <View style={styles.ctaCard}>
        <Text style={styles.cardLabel}>Prochaine étape</Text>
        <Text style={styles.ctaTitle}>{nextCourse?.nextModule?.title ?? 'Découvrir la prochaine unité'}</Text>
        <Text style={styles.ctaText}>
          Continuez votre parcours pour progresser vers la prochaine certification.
        </Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={[styles.ctaButton, styles.primaryButton]}
            onPress={() => {
              if (nextCourse?.slug) router.push(`/course/${nextCourse.slug}`);
            }}
          >
            <Text style={styles.primaryButtonText}>{primaryCtaLabel}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={loadDashboard} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir la progression</Text>
      </Pressable>

      <Pressable
        style={styles.supportCard}
        onPress={() => void Linking.openURL(`${WEB_URL}/soutenir`)}
      >
        <Text style={styles.supportEyebrow}>{'\u{1F49A}'} Soutenir le projet</Text>
        <Text style={styles.supportTitle}>Formation 100 % gratuite</Text>
        <Text style={styles.supportHint}>
          Un don volontaire aide l’hébergement — ouvre la page web /soutenir.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function SprintCard({
  sprint,
  startingTrack,
  message,
  styles,
  colors,
  onStart,
  onOpenSprint,
}: {
  sprint: CertificationSprintSummary | null;
  startingTrack: CertificationSprintTrack | null;
  message: SprintMessage | null;
  styles: ReturnType<typeof createStyles>;
  colors: AppThemeColors;
  onStart: (track: CertificationSprintTrack) => void;
  onOpenSprint: () => void;
}) {
  const sprintStatus = sprint ? formatSprintStatus(sprint) : null;
  const isStartingAnySprint = startingTrack !== null;

  return (
    <View style={styles.sprintCard}>
      <View style={styles.sprintHeader}>
        <View style={styles.sprintText}>
          <Text style={styles.cardLabel}>Sprint certification</Text>
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
          <ProgressBar progress={sprint.progressPercent} fillColor={colors.accent} styles={styles} />
          <Text style={styles.sprintMeta}>
            {formatTrack(sprint.track)} · {sprint.progress}/{sprint.target} unités ·{' '}
            {sprint.progressPercent} % complété
          </Text>
          <View style={styles.sprintMetrics}>
            <SprintMetric label="Parcours" value={formatTrack(sprint.track)} styles={styles} />
            <SprintMetric label="Objectif" value={`${sprint.progress}/${sprint.target}`} styles={styles} />
            <SprintMetric label="Restants" value={String(sprint.remainingModules)} styles={styles} />
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
      <Pressable onPress={onOpenSprint} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Gérer le sprint (7 / 14 j) →</Text>
      </Pressable>
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
    <View style={styles.sprintMetric}>
      <Text style={styles.sprintMetricValue}>{value}</Text>
      <Text style={styles.sprintMetricLabel}>{label}</Text>
    </View>
  );
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

function CourseProgressCard({
  course,
  styles,
  onPress,
}: {
  course: CourseSummary;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const progress = course.progressPercent ?? 0;

  return (
    <Pressable onPress={onPress} style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <View style={styles.courseText}>
          <Text style={styles.courseTrack}>{formatTrack(course.track)}</Text>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseMeta}>
            {course.completedModules ?? 0}/{course.totalModules ?? 0} unités · {progress} %
          </Text>
        </View>
        <Text style={styles.courseChevron}>›</Text>
      </View>
      <ProgressBar progress={progress} styles={styles} />
      <Text style={styles.nextModule}>
        {course.nextModule ? `À suivre : ${course.nextModule.title}` : 'Parcours terminé'}
      </Text>
    </Pressable>
  );
}

function ProgressBar({
  progress,
  fillColor = '#34C759',
  trackColor = '#E5E5EA',
  styles,
}: {
  progress: number;
  fillColor?: string;
  trackColor?: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  title: { color: colors.fg, fontSize: 28, fontWeight: '800', maxWidth: 220 },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerSubtitleRank: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: colors.radiusPill,
    backgroundColor: colors.bgSoft,
  },
  signOutText: { color: colors.muted, fontWeight: '600' },
  streakCard: {
    backgroundColor: '#FFF4E8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F5B87A',
  },
  streakEyebrow: { color: '#B45309', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  streakValue: { color: '#1D1D1F', fontSize: 22, fontWeight: '800', marginTop: 6 },
  streakMeta: { color: '#6E6E73', marginTop: 4, fontSize: 13, fontWeight: '600' },
  demoBanner: {
    backgroundColor: colors.demoBannerBg,
    borderRadius: colors.radiusLg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.demoBannerBorder,
  },
  demoText: { color: colors.demoBannerText, lineHeight: 20, fontWeight: '600' },
  heroCard: { borderRadius: colors.radiusLg, padding: 20, marginBottom: 16 },
  heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 12 },
  heroStats: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  stat: { flex: 1 },
  statValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.82)', marginTop: 4 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressCopy: { color: 'rgba(255,255,255,0.92)', marginTop: 12, lineHeight: 20, fontWeight: '700' },
  progressMeta: { color: 'rgba(255,255,255,0.78)', marginTop: 6, lineHeight: 18, fontSize: 13 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickAction: { flex: 1, borderRadius: 18, padding: 14 },
  quickActionQuests: { backgroundColor: colors.demoBannerBg, borderWidth: 1, borderColor: colors.demoBannerBorder },
  quickActionLeaderboard: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#bfdbfe' },
  quickActionBadges: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  quickActionSprint: { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
  quickActionIcon: { fontSize: 22, marginBottom: 6 },
  quickActionTitle: { color: colors.fg, fontSize: 15, fontWeight: '800' },
  quickActionHint: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
  sectionHint: { color: colors.muted, marginTop: 2, fontSize: 13 },
  emptyText: { color: colors.muted, lineHeight: 20, marginBottom: 16 },
  catalogButton: { marginBottom: 24, paddingVertical: 6 },
  catalogButtonText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  questCard: { backgroundColor: colors.bgSoft, borderRadius: colors.radiusLg, padding: 14, marginBottom: 10 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  questLabel: { flex: 1, color: colors.fg, fontWeight: '700', lineHeight: 20 },
  questCount: { color: colors.accent, fontWeight: '800' },
  linkButton: { marginBottom: 24, paddingVertical: 4 },
  linkButtonText: { color: colors.accent, fontWeight: '700' },
  sprintCard: { backgroundColor: colors.bgSoft, borderRadius: colors.radiusLg, padding: 18, marginBottom: 24 },
  cardLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  sprintHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  sprintText: { flex: 1 },
  sprintTitle: { color: colors.fg, fontSize: 21, fontWeight: '800' },
  sprintDuration: {
    backgroundColor: colors.accentSoft,
    borderRadius: colors.radiusPill,
    color: colors.accentStrong,
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
  sprintStatusActive: { backgroundColor: colors.accentSoft, color: colors.accentStrong },
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
  sprintMessageInfo: { backgroundColor: colors.accentSoft, color: colors.accentStrong },
  trackButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  trackButton: {
    backgroundColor: colors.accent,
    borderRadius: colors.radiusMd,
    minWidth: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonDisabled: { opacity: 0.6 },
  trackButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackButtonText: { color: '#FFFFFF', fontWeight: '800' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: { fontSize: 16 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  courseCard: { backgroundColor: colors.bgSoft, borderRadius: colors.radiusLg, padding: 16, marginBottom: 12 },
  courseHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  courseText: { flex: 1 },
  courseChevron: { color: colors.accentTeal, fontSize: 28, fontWeight: '300', marginTop: 8 },
  courseTrack: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  courseTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginTop: 4 },
  courseMeta: { color: colors.muted, marginTop: 4, marginBottom: 12 },
  nextModule: { color: colors.muted, marginTop: 12, lineHeight: 20 },
  ctaCard: { backgroundColor: colors.bgSoft, borderRadius: colors.radiusLg, padding: 18, marginTop: 4 },
  ctaTitle: { color: colors.fg, fontSize: 21, fontWeight: '800', marginBottom: 8 },
  ctaText: { color: colors.muted, lineHeight: 20, marginBottom: 14 },
  ctaButtons: { flexDirection: 'row', gap: 10 },
  ctaButton: { flex: 1, padding: 14, borderRadius: colors.radiusMd, alignItems: 'center' },
  primaryButton: { backgroundColor: colors.accent },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: colors.accent, fontWeight: '700' },
  supportCard: {
    marginTop: 8,
    marginBottom: 24,
    padding: 18,
    borderRadius: colors.radiusLg,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  supportEyebrow: { color: '#047857', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  supportTitle: { color: colors.fg, fontWeight: '800', fontSize: 18, marginTop: 6 },
  supportHint: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  });
}
