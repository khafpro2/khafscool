import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TrackIcon } from '../../components/TrackIcon';
import { formatTrack, theme } from '../../lib/design';
import {
  WeeklyQuest,
  WeeklyQuestsResponse,
  fetchWeeklyQuests,
  formatResetLabel,
  formatWeekRange,
} from '../../services/gamification';

export function QuestsScreen() {
  const router = useRouter();
  const [data, setData] = useState<WeeklyQuestsResponse | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);

  const loadQuests = useCallback(async () => {
    setLoading(true);
    const result = await fetchWeeklyQuests();
    setData(result.data);
    setSource(result.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadQuests();
  }, [loadQuests]);

  const summary = useMemo(() => buildSummary(data?.quests ?? []), [data]);

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.accent} />
        <Text style={styles.loadingText}>Chargement des quêtes…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Retour</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{'\u{1F3AF}'} Quêtes hebdo</Text>
        <Text style={styles.heroTitle}>Renouvelle ton rythme chaque semaine</Text>
        <Text style={styles.heroCopy}>
          Des objectifs courts sur Apple, Jamf et Intune pour entretenir ta progression.
        </Text>
        <Text style={styles.heroMeta}>{formatWeekRange(data.weekStart, data.weekEnd)}</Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connecte-toi pour synchroniser tes vraies quêtes via GET /quests/weekly.
          </Text>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <SummaryStat label="Terminées" value={String(summary.completed)} />
        <SummaryStat label="En cours" value={String(summary.inProgress)} />
        <SummaryStat label="Points bonus" value={`+${summary.earnedPoints}`} />
      </View>

      <Text style={styles.resetLabel}>{formatResetLabel(data.weekEnd)}</Text>

      {data.quests.length > 0 ? (
        data.quests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
      ) : (
        <Text style={styles.emptyText}>
          Aucune quête active. Termine une unité ou démarre un sprint pour garder le rythme.
        </Text>
      )}

      <Pressable onPress={loadQuests} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir les quêtes</Text>
      </Pressable>
    </ScrollView>
  );
}

function QuestCard({ quest }: { quest: WeeklyQuest }) {
  const target = Math.max(1, quest.target);
  const percent = Math.min(100, Math.round((quest.progress / target) * 100));

  return (
    <View style={[styles.questCard, quest.completed ? styles.questCardCompleted : null]}>
      <View style={styles.questHeader}>
        <View style={styles.questTitleRow}>
          {quest.track ? <TrackIcon track={quest.track} size="sm" /> : null}
          <Text style={styles.questLabel}>{quest.label}</Text>
        </View>
        <Text style={[styles.questStatus, quest.completed ? styles.questStatusDone : null]}>
          {quest.completed ? 'Terminée' : `${quest.progress}/${quest.target}`}
        </Text>
      </View>
      {quest.description ? <Text style={styles.questDescription}>{quest.description}</Text> : null}
      <ProgressBar progress={percent} fillColor={quest.completed ? theme.success : theme.accent} />
      <View style={styles.questFooter}>
        {quest.track ? (
          <Text style={styles.questTrack}>{formatTrack(quest.track)}</Text>
        ) : (
          <Text style={styles.questTrack}>Toutes pistes</Text>
        )}
        {quest.rewardPoints ? (
          <Text style={styles.questReward}>+{quest.rewardPoints} pts</Text>
        ) : null}
      </View>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ progress, fillColor }: { progress: number; fillColor: string }) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

function buildSummary(quests: WeeklyQuest[]) {
  return quests.reduce(
    (acc, quest) => {
      const completed = quest.completed || (quest.target > 0 && quest.progress >= quest.target);
      if (completed) {
        acc.completed += 1;
        acc.earnedPoints += quest.rewardPoints ?? 0;
      } else if (quest.progress > 0) {
        acc.inProgress += 1;
      }
      return acc;
    },
    { completed: 0, inProgress: 0, earnedPoints: 0 }
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  loadingText: { marginTop: 12, color: theme.muted, fontSize: 15 },
  backLink: { marginBottom: 12 },
  backLinkText: { color: theme.accent, fontWeight: '700', fontSize: 15 },
  heroCard: {
    backgroundColor: theme.accentStrong,
    borderRadius: theme.radiusLg,
    padding: 20,
    marginBottom: 16,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heroCopy: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
  heroMeta: { color: 'rgba(255,255,255,0.78)', marginTop: 10, fontSize: 13, fontWeight: '600' },
  demoBanner: {
    backgroundColor: theme.demoBannerBg,
    borderRadius: theme.radiusLg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.demoBannerBorder,
  },
  demoText: { color: theme.demoBannerText, lineHeight: 20, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  summaryStat: { flex: 1, backgroundColor: theme.bgSoft, borderRadius: theme.radiusMd, padding: 12 },
  summaryValue: { color: theme.fg, fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: theme.muted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  resetLabel: { color: theme.muted, fontSize: 13, fontWeight: '600', marginBottom: 16 },
  questCard: {
    backgroundColor: theme.bgSoft,
    borderRadius: theme.radiusLg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.accentSoft,
  },
  questCardCompleted: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  questTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  questLabel: { flex: 1, color: theme.fg, fontWeight: '800', lineHeight: 20, fontSize: 16 },
  questStatus: { color: theme.accent, fontWeight: '800' },
  questStatusDone: { color: theme.success },
  questDescription: { color: theme.muted, lineHeight: 20, marginBottom: 10 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E5E5EA' },
  progressFill: { height: '100%', borderRadius: 999 },
  questFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  questTrack: { color: theme.muted, fontSize: 12, fontWeight: '700' },
  questReward: { color: theme.accentStrong, fontWeight: '800', fontSize: 13 },
  emptyText: { color: theme.muted, lineHeight: 20, marginBottom: 16 },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: theme.accent, fontWeight: '700' },
});
