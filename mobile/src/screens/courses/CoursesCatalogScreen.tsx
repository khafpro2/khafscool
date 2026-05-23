import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { QUESTIONS_PER_MODULE } from '@ama/shared/constants';
import { BrandIcon } from '../../components/BrandIcon';
import { TrackFilterChips } from '../../components/TrackFilterChips';
import { type TrackFilter } from '../../lib/track-filters';
import { LEARNING_PATHS } from '../../lib/learningPaths';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { CourseSummary, fetchCourses } from '../../services/courses';
import { getAccessToken } from '../../services/auth';

export function CoursesCatalogScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [source, setSource] = useState<'api' | 'demo'>('api');
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<TrackFilter>('TOUS');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function loadCatalog() {
    setLoading(true);
    const token = await getAccessToken();
    setIsAuthenticated(Boolean(token));
    const result = await fetchCourses();
    setCourses(result.data);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  const coursesBySlug = useMemo(() => {
    const map = new Map<string, CourseSummary>();
    for (const course of courses) {
      map.set(course.slug, course);
    }
    return map;
  }, [courses]);

  const visiblePaths = useMemo(
    () =>
      selectedTrack === 'TOUS'
        ? LEARNING_PATHS
        : LEARNING_PATHS.filter((path) => path.track === selectedTrack),
    [selectedTrack]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement du catalogue…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MDM Academy</Text>
        <Text style={styles.title}>Apprends Apple, Jamf Pro et Intune</Text>
        <Text style={styles.subtitle}>
          Trois parcours de 3 unités — support Apple, administration Jamf et enrôlement Microsoft Intune.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : catalogue local affiché (API indisponible ou sans session).
          </Text>
        </View>
      ) : null}

      <TrackFilterChips selected={selectedTrack} onSelect={setSelectedTrack} />

      {visiblePaths.map((path) => {
        const course = coursesBySlug.get(path.slug);
        return (
          <CatalogCourseCard
            key={path.slug}
            path={path}
            course={course}
            styles={styles}
            showProgress={isAuthenticated}
            onPress={() => router.push(`/course/${path.slug}`)}
          />
        );
      })}

      <Pressable onPress={loadCatalog} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le catalogue</Text>
      </Pressable>
    </ScrollView>
  );
}

function CatalogCourseCard({
  path,
  course,
  styles,
  showProgress,
  onPress,
}: {
  path: (typeof LEARNING_PATHS)[number];
  course?: CourseSummary;
  styles: ReturnType<typeof createStyles>;
  showProgress: boolean;
  onPress: () => void;
}) {
  const visual = getTrackVisual(path.track);
  const moduleCount = course?.totalModules ?? path.totalModules;
  const completedModules = course?.completedModules ?? 0;
  const progress = course?.progressPercent ?? 0;
  const title = course?.title ?? path.title;
  const moduleQuizLabel = `${moduleCount} module${moduleCount > 1 ? 's' : ''} · ${QUESTIONS_PER_MODULE} Q/module`;
  const inProgress = progress > 0 && progress < 100;
  const isCompleted = progress >= 100;
  const shouldShowProgress = showProgress;
  const ctaLabel =
    inProgress ? 'Continuer ce parcours' : isCompleted ? 'Revoir' : 'Commencer gratuitement';

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.banner, { backgroundColor: visual.gradient[0] }]}>
        <BrandIcon brand={path.brand} size="lg" variant="onColor" />
        <Text style={styles.bannerTrack}>{formatTrack(path.track)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{moduleQuizLabel}</Text>
        {shouldShowProgress ? (
          <>
            <ProgressBar progress={progress} styles={styles} />
            <Text style={styles.progressLabel}>
              {completedModules}/{moduleCount} unités · {progress} %
            </Text>
          </>
        ) : null}
        <View style={styles.objectives}>
          {path.objectives.map((objective) => (
            <Text key={objective} style={styles.objectiveItem}>
              • {objective}
            </Text>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ProgressBar({
  progress,
  styles,
}: {
  progress: number;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress}%` }]} />
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
  header: { marginBottom: 20 },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  title: { color: colors.fg, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 22, fontSize: 15 },
  demoBanner: {
    backgroundColor: colors.demoBannerBg,
    borderRadius: colors.radiusLg,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.demoBannerBorder,
  },
  demoText: { color: colors.demoBannerText, lineHeight: 20, fontWeight: '600' },
  card: {
    backgroundColor: colors.bgSoft,
    borderRadius: colors.radiusLg,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTrack: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  cardBody: { padding: 16 },
  cardTitle: { color: colors.fg, fontSize: 18, fontWeight: '800' },
  cardMeta: { color: colors.muted, marginTop: 6, fontSize: 13, fontWeight: '600' },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginTop: 10,
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.accent },
  progressLabel: { color: colors.muted, marginTop: 6, fontSize: 12, fontWeight: '700' },
  objectives: { marginTop: 10, gap: 4 },
  objectiveItem: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 14 },
  ctaLabel: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  ctaArrow: { color: colors.accentTeal, fontSize: 18, fontWeight: '300' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: colors.accent, fontWeight: '700' },
  });
}
