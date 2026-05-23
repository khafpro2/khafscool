import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { PRACTICE_EXAM_QUESTION_COUNT } from '@ama/shared/practice-exam';
import { WEB_URL } from '../../config';
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { fetchCourse, fetchCourseProgress } from '../../services/courses';

export function CoursePracticeExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [courseTitle, setCourseTitle] = useState('');
  const [track, setTrack] = useState<'APPLE' | 'JAMF' | 'INTUNE'>('APPLE');
  const [poolSize, setPoolSize] = useState(40);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    void (async () => {
      try {
        const { data: course } = await fetchCourse(slug);
        if (cancelled) return;

        setCourseTitle(course.title);
        setTrack(course.track as 'APPLE' | 'JAMF' | 'INTUNE');
        const totalQuestions = course.modules.reduce((sum, module) => sum + module.questions.length, 0);
        setPoolSize(totalQuestions || 40);

        try {
          const progress = await fetchCourseProgress(slug);
          if (cancelled) return;
          if (progress.data.progress.progressPercent < 100) {
            setBlocked(true);
          }
        } catch {
          // Mode démo : autoriser l'accès
        }
      } catch {
        if (!cancelled) setBlocked(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visual = getTrackVisual(track);
  const examUrl = `${WEB_URL}/courses/${slug}/examen`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement de l&apos;examen blanc…</Text>
      </View>
    );
  }

  if (blocked) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedTitle}>Examen blanc verrouillé</Text>
        <Text style={styles.blockedText}>
          Termine les 4 modules du parcours pour accéder à l&apos;examen blanc ({PRACTICE_EXAM_QUESTION_COUNT}{' '}
          questions parmi {poolSize}).
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace(`/course/${slug}`)}>
          <Text style={styles.primaryButtonText}>Reprendre le parcours</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: visual.gradient[0] }]}>
        <Text style={styles.heroEyebrow}>{'\u{1F4DD}'} Examen blanc</Text>
        <TrackIcon track={track} size="md" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTitle}>{courseTitle}</Text>
        <Text style={styles.heroText}>
          {PRACTICE_EXAM_QUESTION_COUNT} questions aléatoires · banque de {poolSize} · piste {formatTrack(track)}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Entraînement sans impact progression</Text>
        <Text style={styles.infoText}>
          L&apos;examen blanc pioche {PRACTICE_EXAM_QUESTION_COUNT} QCM dans les {poolSize} questions du parcours.
          Ouvre la version web pour répondre avec le même quiz interactif que sur ordinateur.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => void Linking.openURL(examUrl)}>
          <Text style={styles.primaryButtonText}>Commencer l&apos;examen (web)</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/course/${slug}/revision`)}>
          <Text style={styles.secondaryButtonText}>Fiche révision</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={() => router.replace(`/course/${slug}`)}>
          <Text style={styles.ghostButtonText}>Retour au parcours</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    loadingText: { marginTop: 12, color: colors.muted },
    blockedContainer: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.bg },
    blockedTitle: { color: colors.fg, fontSize: 24, fontWeight: '800' },
    blockedText: { color: colors.muted, marginTop: 10, lineHeight: 22 },
    hero: { borderRadius: 20, padding: 18, marginBottom: 16 },
    heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 6 },
    heroText: { color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 21 },
    infoCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    infoTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    infoText: { color: colors.muted, marginTop: 8, lineHeight: 22 },
    actions: { gap: 10 },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
    secondaryButton: {
      backgroundColor: colors.bgSoft,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: { color: colors.accent, fontWeight: '800' },
    ghostButton: { padding: 12, alignItems: 'center' },
    ghostButtonText: { color: colors.muted, fontWeight: '700' },
  });
}
