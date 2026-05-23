import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { toastAlmostComplete } from '../../lib/gamification-toasts';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { CourseSummary } from '../../services/progress';

const shownAlmostCompleteToasts = new Set<string>();

function findAlmostCompleteCourses(courses: CourseSummary[]) {
  return courses.filter(
    (course) =>
      course.totalModules === 4 &&
      course.completedModules === 3 &&
      (course.progressPercent ?? 0) < 100
  );
}

export function AlmostCompleteBanner({ courses }: { courses: CourseSummary[] }) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const almostComplete = useMemo(() => findAlmostCompleteCourses(courses), [courses]);

  useEffect(() => {
    if (!almostComplete.length) return;

    for (const course of almostComplete) {
      const key = `almost-complete-toast:${course.slug}`;
      if (shownAlmostCompleteToasts.has(key)) continue;
      shownAlmostCompleteToasts.add(key);
      toastAlmostComplete(course.title);
    }
  }, [almostComplete]);

  if (!almostComplete.length) return null;

  const primary = almostComplete[0];
  const resumePath = `/course/${primary.slug}`;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Presque terminé</Text>
      <Text style={styles.title}>Plus qu&apos;une unité pour le badge !</Text>
      <Text style={styles.body}>
        {almostComplete.length === 1 ? (
          <>
            « {primary.title} » — 3/4 modules complétés. Termine la dernière unité pour débloquer ton
            super-badge piste.
          </>
        ) : (
          <>
            {almostComplete.length} parcours à 3/4 modules —{' '}
            {almostComplete.map((course) => course.title).join(', ')}.
          </>
        )}
      </Text>
      {almostComplete.length === 1 && primary.nextModule ? (
        <Text style={styles.meta}>Prochaine unité : {primary.nextModule.title}</Text>
      ) : null}
      <Pressable style={styles.button} onPress={() => router.push(resumePath)}>
        <Text style={styles.buttonText}>Continuer</Text>
      </Pressable>
      {almostComplete.length > 1 ? (
        <Pressable onPress={() => router.push('/(tabs)/courses')} style={styles.link}>
          <Text style={styles.linkText}>Voir le catalogue →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: '#ecfdf5',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(10, 92, 46, 0.22)',
    },
    eyebrow: {
      color: '#0a5c2e',
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.fg,
      fontSize: 20,
      fontWeight: '800',
      marginTop: 6,
    },
    body: {
      color: colors.muted,
      marginTop: 6,
      lineHeight: 20,
    },
    meta: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 6,
      fontWeight: '600',
    },
    button: {
      marginTop: 14,
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    link: {
      marginTop: 8,
      paddingVertical: 4,
    },
    linkText: {
      color: colors.accent,
      fontWeight: '700',
    },
  });
}
