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
import { BrandIcon } from '../../components/BrandIcon';
import { TrackFilterChips } from '../../components/TrackFilterChips';
import { filterLeaderboardByTrack, type TrackFilter } from '../../lib/track-filters';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatLevel, getBadgeVisual, getRankInfo } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import {
  LeaderboardEntry,
  LeaderboardResponse,
  fetchLeaderboard,
} from '../../services/gamification';

export function LeaderboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<TrackFilter>('TOUS');

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    const result = await fetchLeaderboard();
    setData(result.data);
    setSource(result.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement du classement…</Text>
      </View>
    );
  }

  const filteredLeaderboard = useMemo(
    () => filterLeaderboardByTrack(data.leaderboard, selectedTrack),
    [data.leaderboard, selectedTrack]
  );

  const filteredCurrentUserRank = useMemo(() => {
    const currentEntry = data.leaderboard.find((entry) => entry.isCurrentUser);
    if (!currentEntry) return null;
    if (selectedTrack !== 'TOUS' && !filteredLeaderboard.some((entry) => entry.isCurrentUser)) {
      return null;
    }
    const index = filteredLeaderboard.findIndex((entry) => entry.isCurrentUser);
    return index >= 0 ? index + 1 : data.currentUserRank;
  }, [data, filteredLeaderboard, selectedTrack]);

  const topThree = filteredLeaderboard.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Retour</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{'\u{1F3C6}'} Communauté MDM Academy</Text>
        <Text style={styles.heroTitle}>Classement par points</Text>
        <Text style={styles.heroCopy}>
          Compare ta progression aux autres apprenants Apple, Jamf et Intune.
        </Text>
        {filteredCurrentUserRank != null ? (
          <Text style={styles.heroMeta}>Ton rang : #{filteredCurrentUserRank}</Text>
        ) : selectedTrack !== 'TOUS' ? (
          <Text style={styles.heroMeta}>Aucun rang sur cette piste pour le moment.</Text>
        ) : null}
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connecte-toi pour voir ton vrai rang via GET /leaderboard.
          </Text>
        </View>
      ) : null}

      <TrackFilterChips selected={selectedTrack} onSelect={setSelectedTrack} />

      {topThree.length > 0 ? (
        <View style={styles.podiumRow}>
          {topThree.map((entry) => (
            <PodiumCard key={entry.rank} entry={entry} styles={styles} />
          ))}
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top apprenants</Text>
      </View>

      {filteredLeaderboard.length > 0 ? (
        filteredLeaderboard.map((entry) => <LeaderboardRow key={entry.rank} entry={entry} styles={styles} />)
      ) : (
        <Text style={styles.emptyText}>
          {selectedTrack === 'TOUS'
            ? 'Aucun classement disponible pour le moment.'
            : 'Aucun apprenant classé sur cette piste pour le moment.'}
        </Text>
      )}

      <Pressable onPress={loadLeaderboard} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le classement</Text>
      </Pressable>
    </ScrollView>
  );
}

function PodiumCard({
  entry,
  styles,
}: {
  entry: LeaderboardEntry;
  styles: ReturnType<typeof createStyles>;
}) {
  const rank = getRankInfo(entry.points);
  const medal = entry.rank === 1 ? '\u{1F947}' : entry.rank === 2 ? '\u{1F948}' : '\u{1F949}';

  return (
    <View style={[styles.podiumCard, entry.isCurrentUser ? styles.podiumCardCurrent : null]}>
      <Text style={styles.podiumMedal}>{medal}</Text>
      <Text style={styles.podiumName} numberOfLines={2}>
        {entry.displayName}
      </Text>
      <Text style={styles.podiumPoints}>{entry.points} pts</Text>
      <Text style={styles.podiumRank}>{rank.icon} {rank.name}</Text>
    </View>
  );
}

function LeaderboardRow({
  entry,
  styles,
}: {
  entry: LeaderboardEntry;
  styles: ReturnType<typeof createStyles>;
}) {
  const rank = getRankInfo(entry.points);

  return (
    <View style={[styles.rowCard, entry.isCurrentUser ? styles.rowCardCurrent : null]}>
      <View style={styles.rowMain}>
        <Text style={styles.rowRank}>#{entry.rank}</Text>
        <View style={styles.rowText}>
          <Text style={styles.rowName}>{entry.displayName}</Text>
          <Text style={styles.rowMeta}>
            {formatLevel(entry.level)} · {rank.name}
          </Text>
        </View>
        <Text style={styles.rowPoints}>{entry.points}</Text>
      </View>
      {entry.badges.length > 0 ? (
        <View style={styles.badgeRow}>
          {entry.badges.slice(0, 3).map((badge) => {
            const visual = getBadgeVisual(badge);
            return (
              <View key={badge} style={[styles.badge, { backgroundColor: visual.bg }]}>
                {visual.brand ? (
                  <BrandIcon brand={visual.brand} size="sm" />
                ) : (
                  <Text style={styles.badgeIcon}>{visual.icon}</Text>
                )}
                <Text style={[styles.badgeText, { color: visual.color }]} numberOfLines={1}>
                  {visual.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
    backLink: { marginBottom: 12 },
    backLinkText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    heroCard: {
      backgroundColor: colors.accentTeal,
      borderRadius: colors.radiusLg,
      padding: 20,
      marginBottom: 16,
    },
    heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 8 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
    heroCopy: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
    heroMeta: { color: 'rgba(255,255,255,0.92)', marginTop: 10, fontSize: 15, fontWeight: '800' },
    demoBanner: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: colors.radiusLg,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    demoText: { color: colors.demoBannerText, lineHeight: 20, fontWeight: '600' },
    podiumRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    podiumCard: {
      flex: 1,
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    podiumCardCurrent: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    podiumMedal: { fontSize: 24, marginBottom: 6 },
    podiumName: { color: colors.fg, fontWeight: '800', fontSize: 13, textAlign: 'center', minHeight: 34 },
    podiumPoints: { color: colors.accentStrong, fontWeight: '800', marginTop: 4 },
    podiumRank: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    sectionHeader: { marginBottom: 10 },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
    rowCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    rowCardCurrent: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    rowMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowRank: { color: colors.accent, fontWeight: '800', fontSize: 16, width: 36 },
    rowText: { flex: 1 },
    rowName: { color: colors.fg, fontWeight: '800', fontSize: 16 },
    rowMeta: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
    rowPoints: { color: colors.accentStrong, fontWeight: '800', fontSize: 18 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      maxWidth: '100%',
    },
    badgeIcon: { fontSize: 14 },
    badgeText: { fontWeight: '700', fontSize: 11, flexShrink: 1 },
    emptyText: { color: colors.muted, lineHeight: 20, marginBottom: 16 },
    refreshButton: { padding: 16, alignItems: 'center' },
    refreshText: { color: colors.accent, fontWeight: '700' },
  });
}
