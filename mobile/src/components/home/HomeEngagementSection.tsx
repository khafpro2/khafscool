import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { countCompletedQuests } from '../../lib/quest-feedback';
import type { CertificationSprintSummary } from '../../services/sprint';

type QuestLike = {
  id: string;
  label: string;
  progress: number;
  target: number;
  completed?: boolean;
};

type HomeEngagementSectionProps = {
  quests: QuestLike[];
  sprint: CertificationSprintSummary | null;
};

export function HomeEngagementSection({ quests, sprint }: HomeEngagementSectionProps) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  const completedQuests = countCompletedQuests(
    quests.map((quest) => ({
      ...quest,
      questKey: quest.id,
      completed: quest.completed ?? (quest.target > 0 && quest.progress >= quest.target),
    }))
  );
  const totalQuests = quests.length;
  const questProgressPercent =
    totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const featuredQuest =
    quests.find((quest) => !quest.completed && quest.progress < quest.target) ?? quests[0];
  const featuredQuestPercent =
    featuredQuest && featuredQuest.target > 0
      ? Math.min(100, Math.round((featuredQuest.progress / featuredQuest.target) * 100))
      : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionEyebrow}>Engagement</Text>
          <Text style={styles.sectionTitle}>Tes objectifs en cours</Text>
          <Text style={styles.sectionHint}>
            Quêtes hebdo et sprint certification — synchronisés avec ton tableau de bord.
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, styles.questCard]}>
          <Text style={styles.cardEyebrow}>Quête de la semaine</Text>
          <Text style={styles.cardTitle}>
            {completedQuests > 0
              ? `${completedQuests}/${totalQuests} quête${totalQuests > 1 ? 's' : ''} complétée${completedQuests > 1 ? 's' : ''}`
              : 'Débloque tes bonus hebdo'}
          </Text>
          <Text style={styles.cardCaption}>
            {featuredQuest
              ? `${featuredQuest.label} — ${featuredQuest.progress}/${featuredQuest.target}`
              : 'Valide des unités Apple, Jamf ou Intune avant la réinitialisation hebdomadaire.'}
          </Text>
          <ProgressBar
            progress={featuredQuest ? featuredQuestPercent : questProgressPercent}
            fillColor="#34C759"
            styles={styles}
          />
          <Text style={styles.cardMeta}>
            Progression globale : {questProgressPercent} % · réinitialisation chaque lundi
          </Text>
          <Pressable style={styles.cardButton} onPress={() => router.push('/quests')}>
            <Text style={styles.cardButtonText}>Voir mes quêtes</Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.sprintCard]}>
          <Text style={[styles.cardEyebrow, styles.sprintEyebrow]}>Sprint certification</Text>
          {sprint ? (
            <>
              <Text style={styles.cardTitle}>{sprint.label}</Text>
              <Text style={styles.cardCaption}>
                {formatTrack(sprint.track)} · {sprint.days} jours · {formatSprintStatus(sprint)} ·{' '}
                {sprint.progress}/{sprint.target} unités
              </Text>
              <ProgressBar
                progress={Math.min(100, sprint.progressPercent)}
                fillColor="#6366F1"
                styles={styles}
              />
              <Text style={styles.cardMeta}>
                {sprint.remainingModules} unité{sprint.remainingModules > 1 ? 's' : ''} restante
                {sprint.remainingModules > 1 ? 's' : ''} · {sprint.progressPercent} % complété
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Planifie ta révision</Text>
              <Text style={styles.cardCaption}>
                Lance un cycle de 7 ou 14 jours sur Apple, Jamf ou Intune pour cadrer ta préparation.
              </Text>
            </>
          )}
          <Pressable style={styles.cardButton} onPress={() => router.push('/sprint')}>
            <Text style={styles.cardButtonText}>
              {sprint ? (sprint.completed ? 'Voir le sprint' : 'Continuer le sprint') : 'Démarrer un sprint'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ProgressBar({
  progress,
  fillColor,
  styles,
}: {
  progress: number;
  fillColor: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

function formatSprintStatus(sprint: CertificationSprintSummary) {
  if (sprint.completed) return 'Terminé';
  if (sprint.expired) return 'Expiré';
  return 'Actif';
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    section: { marginBottom: 24 },
    sectionHeader: { marginBottom: 12 },
    sectionHeaderText: { flex: 1 },
    sectionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800', marginTop: 4 },
    sectionHint: { color: colors.muted, marginTop: 4, fontSize: 13, lineHeight: 18 },
    grid: { gap: 12 },
    card: {
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
    },
    questCard: {
      backgroundColor: colors.demoBannerBg,
      borderColor: colors.demoBannerBorder,
    },
    sprintCard: {
      backgroundColor: colors.accentSoft,
      borderColor: '#c7d2fe',
    },
    cardEyebrow: {
      color: colors.demoBannerText,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    sprintEyebrow: { color: colors.accentStrong },
    cardTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginTop: 6 },
    cardCaption: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 13 },
    progressTrack: {
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: colors.border,
      marginTop: 12,
    },
    progressFill: { height: '100%', borderRadius: 999 },
    cardMeta: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 17 },
    cardButton: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    cardButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  });
}
