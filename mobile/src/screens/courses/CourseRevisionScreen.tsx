import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { buildRevisionSections, type RevisionModuleSection } from '@ama/shared/revision-sheet';
import { parseInlineWithGlossary } from '@ama/shared/lesson-markdown';
import { glossaryMobilePath } from '@ama/shared/glossary';
import { WEB_URL } from '../../config';
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { fetchCourse, fetchCourseProgress } from '../../services/courses';

export function CourseRevisionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [sections, setSections] = useState<RevisionModuleSection[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [track, setTrack] = useState<'APPLE' | 'JAMF' | 'INTUNE'>('APPLE');
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
        setSections(buildRevisionSections(course.modules));

        try {
          const progress = await fetchCourseProgress(slug);
          if (cancelled) return;
          if (progress.data.progress.progressPercent < 100) {
            setBlocked(true);
          }
        } catch {
          // Mode démo ou API indisponible : afficher la fiche
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

  const takeawayCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.takeaways.length, 0),
    [sections]
  );
  const visual = getTrackVisual(track);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement de la fiche révision…</Text>
      </View>
    );
  }

  if (blocked) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedTitle}>Fiche révision verrouillée</Text>
        <Text style={styles.blockedText}>
          Termine les 4 modules du parcours pour débloquer la synthèse des points clés.
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
        <Text style={styles.heroEyebrow}>{'\u{1F4D1}'} Fiche révision</Text>
        <TrackIcon track={track} size="md" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTitle}>{courseTitle}</Text>
        <Text style={styles.heroText}>
          {sections.length} modules · {takeawayCount} points clés · piste {formatTrack(track)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => void Linking.openURL(`${WEB_URL}/courses/${slug}/revision`)}>
          <Text style={styles.primaryButtonText}>Imprimer / PDF (web)</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/glossary')}>
          <Text style={styles.secondaryButtonText}>Glossaire MDM</Text>
        </Pressable>
      </View>

      {sections.map((section, sectionIndex) => (
        <View key={section.slug} style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>
            {sectionIndex + 1}. {section.title}
          </Text>
          {section.takeaways.map((takeaway) => (
            <View key={takeaway} style={styles.takeawayRow}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.takeawayText}>
                <TakeawayInline
                  text={takeaway}
                  styles={styles}
                  onGlossaryPress={(termId) => router.push(glossaryMobilePath(termId) as '/glossary')}
                />
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function TakeawayInline({
  text,
  styles,
  onGlossaryPress,
}: {
  text: string;
  styles: ReturnType<typeof createStyles>;
  onGlossaryPress: (termId: string) => void;
}) {
  const linkedTermIds = new Set<string>();

  return (
    <>
      {parseInlineWithGlossary(text, linkedTermIds).map((part, index) => {
        if (part.type === 'strong') {
          return (
            <Text key={index} style={styles.strong}>
              {part.value}
            </Text>
          );
        }
        if (part.type === 'glossary') {
          return (
            <Text
              key={index}
              style={styles.glossaryLink}
              accessibilityRole="link"
              onPress={() => onGlossaryPress(part.termId)}
            >
              {part.label}
            </Text>
          );
        }
        if (part.type === 'link') {
          return (
            <Text
              key={index}
              style={styles.glossaryLink}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(part.href)}
            >
              {part.label}
            </Text>
          );
        }
        return part.value;
      })}
    </>
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
    actions: { gap: 10, marginBottom: 16 },
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
    moduleCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    moduleTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginBottom: 10 },
    takeawayRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    bullet: { color: colors.accent, fontWeight: '900', lineHeight: 22 },
    takeawayText: { flex: 1, color: colors.fg, lineHeight: 22, fontSize: 15 },
    strong: { fontWeight: '800' },
    glossaryLink: {
      color: colors.accentTeal ?? colors.accent,
      fontWeight: '700',
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
    },
  });
}
