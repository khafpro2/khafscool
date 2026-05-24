import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LEARNING_PATHS } from '@ama/shared/learning-paths';
import { BrandIcon } from './BrandIcon';
import { TrackIcon } from './TrackIcon';
import type { CourseSummary } from '../services/progress';
import type { AppThemeColors } from '../lib/design';
import { formatTrack, getTrackVisual } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function MdmTracksSection({ courses }: { courses: CourseSummary[] }) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const progressBySlug = new Map(courses.map((course) => [course.slug, course]));

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Mes pistes MDM</Text>
      <Text style={styles.title}>Apple, Jamf Pro et Microsoft Intune</Text>
      <Text style={styles.hint}>Progression par piste — 4 modules chacune</Text>

      {LEARNING_PATHS.map((path) => {
        const course = progressBySlug.get(path.slug);
        const total = course?.totalModules ?? path.totalModules;
        const done = course?.completedModules ?? 0;
        const percent = course?.progressPercent ?? 0;
        const visual = getTrackVisual(path.track);

        return (
          <Pressable
            key={path.slug}
            style={styles.card}
            onPress={() => router.push(`/course/${path.slug}`)}
          >
            <View style={[styles.banner, { backgroundColor: visual.gradient[0] }]}>
              <BrandIcon brand={path.brand} size="md" />
            </View>
            <View style={styles.body}>
              <View style={styles.headerRow}>
                <TrackIcon track={path.track} size="sm" />
                <Text style={styles.trackLabel}>{formatTrack(path.track)}</Text>
              </View>
              <Text style={styles.cardTitle}>{course?.title ?? path.title}</Text>
              <Text style={styles.meta}>
                {done}/{total} modules · {percent} %
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, percent)}%`, backgroundColor: visual.gradient[0] }]} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { marginBottom: 20 },
    eyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    title: { color: colors.fg, fontSize: 20, fontWeight: '800', marginTop: 4 },
    hint: { color: colors.muted, marginTop: 4, marginBottom: 12, fontSize: 13 },
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
      marginBottom: 10,
    },
    banner: { padding: 16, alignItems: 'flex-start' },
    body: { padding: 14 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    trackLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    cardTitle: { color: colors.fg, fontSize: 16, fontWeight: '800', marginTop: 6 },
    meta: { color: colors.accent, fontWeight: '800', marginTop: 6, fontSize: 14 },
    progressTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginTop: 10,
    },
    progressFill: { height: '100%', borderRadius: 999 },
  });
}
