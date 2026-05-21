import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TrackIcon } from '../TrackIcon';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack } from '../../lib/design';
import { formatActivityDate } from '../../lib/points';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface RecentActivityItem {
  id: string;
  slug: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
  track: string;
  completedAt: string | Date | null;
  pointsEarned: number;
}

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
  onBrowseCourses?: () => void;
};

export function RecentActivitySection({ items, onBrowseCourses }: RecentActivitySectionProps) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.sectionEyebrow}>Activité</Text>
        <Text style={styles.emptyTitle}>Aucune activité récente</Text>
        <Text style={styles.emptyText}>
          Termine une unité pour voir ici tes modules complétés et les points gagnés.
        </Text>
        <Pressable
          style={styles.emptyButton}
          onPress={onBrowseCourses ?? (() => router.push('/(tabs)/courses'))}
        >
          <Text style={styles.emptyButtonText}>Explorer les parcours →</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activité récente</Text>
      <Text style={styles.sectionHint}>Tes dernières unités complétées et les points associés.</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => router.push(`/course/${item.courseSlug}`)}
          >
            <TrackIcon track={item.track} size="sm" />
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.courseTitle} · {formatTrack(item.track)} · {formatActivityDate(item.completedAt)}
              </Text>
            </View>
            <Text style={styles.itemPoints}>+{item.pointsEarned} pts</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    section: { marginBottom: 24 },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
    sectionHint: { color: colors.muted, marginTop: 2, marginBottom: 12, fontSize: 13 },
    sectionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    list: { gap: 10 },
    item: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    itemBody: { flex: 1, minWidth: 0 },
    itemTitle: { color: colors.fg, fontSize: 15, fontWeight: '800' },
    itemMeta: { color: colors.muted, marginTop: 4, fontSize: 12, lineHeight: 17 },
    itemPoints: { color: colors.accent, fontWeight: '800', fontSize: 14 },
    emptyCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginTop: 6 },
    emptyText: { color: colors.muted, marginTop: 8, lineHeight: 20, fontSize: 14 },
    emptyButton: { marginTop: 12 },
    emptyButtonText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  });
}
