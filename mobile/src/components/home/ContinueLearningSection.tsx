import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppThemeColors } from '../../lib/design';
import {
  getFallbackResumeAction,
  getResumeLearningAction,
  type ResumeLearningAction,
} from '../../lib/resume-learning';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { CourseSummary } from '../../services/progress';

type ContinueLearningSectionProps = {
  courses: CourseSummary[];
};

export function ContinueLearningSection({ courses }: ContinueLearningSectionProps) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const action: ResumeLearningAction =
    courses.length > 0 ? getResumeLearningAction(courses) : getFallbackResumeAction();

  return (
    <View
      style={[
        styles.card,
        action.hasProgress ? styles.cardActive : null,
      ]}
    >
      <Text style={styles.eyebrow}>Continuer l’apprentissage</Text>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.caption}>{action.description}</Text>
      <Text style={styles.meta}>{action.meta}</Text>
      <Pressable
        style={[styles.button, action.hasProgress ? styles.buttonPrimary : styles.buttonSecondary]}
        onPress={() => router.push(action.route as never)}
      >
        <Text style={[styles.buttonText, action.hasProgress ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
          {action.cta}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    eyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    title: { color: colors.fg, fontSize: 20, fontWeight: '800', marginTop: 6, lineHeight: 26 },
    caption: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 14 },
    meta: { color: colors.muted, marginTop: 8, fontSize: 12, fontWeight: '600' },
    button: {
      marginTop: 14,
      alignSelf: 'flex-start',
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    buttonPrimary: { backgroundColor: colors.accent },
    buttonSecondary: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    buttonText: { fontWeight: '800', fontSize: 14 },
    buttonTextPrimary: { color: '#FFFFFF' },
    buttonTextSecondary: { color: colors.accentStrong },
  });
}
