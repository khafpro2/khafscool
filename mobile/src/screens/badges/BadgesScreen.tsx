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
import { TrackIcon } from '../../components/TrackIcon';
import {
  ALL_BADGE_SLUGS,
  getBadgeCriteria,
  getBadgeTrack,
  getBadgeVisual,
  getTrackVisual,
} from '../../lib/design';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { UserBadgesResult, fetchUserBadges } from '../../services/gamification';

export function BadgesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [data, setData] = useState<UserBadgesResult | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    setLoading(true);
    const result = await fetchUserBadges();
    setData(result.data);
    setSource(result.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBadges();
  }, [loadBadges]);

  const summary = useMemo(() => buildSummary(data), [data]);

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement de ta collection…</Text>
      </View>
    );
  }

  const earnedSet = new Set(data.earnedSlugs);
  const earnedBadges = ALL_BADGE_SLUGS.filter((slug) => earnedSet.has(slug));
  const lockedBadges = ALL_BADGE_SLUGS.filter((slug) => !earnedSet.has(slug));
  const earnedBySlug = new Map(data.badges.map((badge) => [badge.slug, badge]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Retour</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{'\u{1F3C5}'} Galerie des badges</Text>
        <Text style={styles.heroTitle}>Mes super-badges MDM Academy</Text>
        <Text style={styles.heroCopy}>
          Chaque piste Apple, Jamf et Intune récompense ta progression avec un badge distinct.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connecte-toi pour synchroniser tes vrais badges via GET /users/me/dashboard.
          </Text>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <SummaryStat label="Gagnés" value={`${summary.earned} / ${summary.total}`} styles={styles} />
        <SummaryStat label="Apple" value={String(summary.byTrack.APPLE)} styles={styles} />
        <SummaryStat label="Jamf" value={String(summary.byTrack.JAMF)} styles={styles} />
        <SummaryStat label="Intune" value={String(summary.byTrack.INTUNE)} styles={styles} />
      </View>

      <BadgeSection title="Mes badges" eyebrow="Collection débloquée" styles={styles}>
        {earnedBadges.length > 0 ? (
          earnedBadges.map((slug) => (
            <BadgeCard
              key={slug}
              slug={slug}
              earned
              earnedAt={earnedBySlug.get(slug)?.earnedAt}
              styles={styles}
              colors={colors}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            Termine une première unité pour débloquer ton premier super-badge.
          </Text>
        )}
      </BadgeSection>

      <BadgeSection title="À débloquer" eyebrow="Prochains objectifs" styles={styles}>
        {lockedBadges.length > 0 ? (
          lockedBadges.map((slug) => <BadgeCard key={slug} slug={slug} earned={false} styles={styles} colors={colors} />)
        ) : (
          <Text style={styles.emptyText}>
            Bravo — tu as débloqué tous les super-badges disponibles !
          </Text>
        )}
      </BadgeSection>

      <View style={styles.ctaRow}>
        <Pressable style={styles.ctaButton} onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.ctaButtonText}>Explorer les parcours</Text>
        </Pressable>
        <Pressable style={[styles.ctaButton, styles.ctaButtonSecondary]} onPress={() => router.push('/sprint')}>
          <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>Sprint certification</Text>
        </Pressable>
      </View>

      <Pressable onPress={loadBadges} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir la collection</Text>
      </Pressable>
    </ScrollView>
  );
}

function BadgeSection({
  title,
  eyebrow,
  children,
  styles,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BadgeCard({
  slug,
  earned,
  earnedAt,
  styles,
  colors,
}: {
  slug: string;
  earned: boolean;
  earnedAt?: string | null;
  styles: ReturnType<typeof createStyles>;
  colors: AppThemeColors;
}) {
  const visual = getBadgeVisual(slug);
  const track = getBadgeTrack(slug);
  const trackVisual = getTrackVisual(track);

  return (
    <View style={[styles.badgeCard, earned ? styles.badgeCardEarned : styles.badgeCardLocked]}>
      <View style={styles.badgeHeader}>
        <View style={[styles.badgeIconWrap, { backgroundColor: visual.bg }]}>
          {visual.brand ? (
            <BrandIcon brand={visual.brand} size="md" />
          ) : (
            <Text style={styles.badgeIcon}>{visual.icon ?? '\u{1F3C5}'}</Text>
          )}
        </View>
        <View style={styles.badgeText}>
          <View style={styles.badgeTitleRow}>
            <TrackIcon track={track} size="sm" />
            <Text style={styles.badgeLabel}>{visual.label}</Text>
          </View>
          <Text style={styles.badgeCriteria}>{getBadgeCriteria(slug)}</Text>
          {earned && earnedAt ? (
            <Text style={styles.badgeEarnedAt}>Obtenu le {formatEarnedDate(earnedAt)}</Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.badgeStatus, { backgroundColor: earned ? colors.accentTealSoft : trackVisual.gradient[0] + '22' }]}>
        <Text style={[styles.badgeStatusText, { color: earned ? colors.success : trackVisual.color }]}>
          {earned ? 'Débloqué' : 'À débloquer'}
        </Text>
      </View>
    </View>
  );
}

function SummaryStat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function formatEarnedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date à confirmer';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildSummary(data: UserBadgesResult | null) {
  const earnedSlugs = data?.earnedSlugs ?? [];
  const byTrack = { APPLE: 0, JAMF: 0, INTUNE: 0 };

  for (const slug of earnedSlugs) {
    const track = getBadgeTrack(slug);
    if (track === 'APPLE') byTrack.APPLE += 1;
    if (track === 'JAMF') byTrack.JAMF += 1;
    if (track === 'INTUNE') byTrack.INTUNE += 1;
  }

  return {
    earned: earnedSlugs.length,
    total: ALL_BADGE_SLUGS.length,
    byTrack,
  };
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
      backgroundColor: colors.accentStrong,
      borderRadius: colors.radiusLg,
      padding: 20,
      marginBottom: 16,
    },
    heroEyebrow: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '800', marginBottom: 8 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
    heroCopy: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
    demoBanner: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: colors.radiusLg,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    demoText: { color: colors.demoBannerText, lineHeight: 20, fontWeight: '600' },
    summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    summaryStat: {
      flexGrow: 1,
      flexBasis: '22%',
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusMd,
      padding: 12,
      minWidth: 72,
    },
    summaryValue: { color: colors.fg, fontSize: 18, fontWeight: '800' },
    summaryLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
    section: { marginBottom: 20 },
    sectionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800', marginBottom: 12 },
    sectionBody: { gap: 10 },
    badgeCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    badgeCardEarned: { borderColor: colors.success, backgroundColor: colors.accentTealSoft },
    badgeCardLocked: { opacity: 0.92 },
    badgeHeader: { flexDirection: 'row', gap: 12 },
    badgeIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeIcon: { fontSize: 24 },
    badgeText: { flex: 1 },
    badgeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    badgeLabel: { flex: 1, color: colors.fg, fontWeight: '800', fontSize: 16, lineHeight: 20 },
    badgeCriteria: { color: colors.muted, lineHeight: 18, fontSize: 13 },
    badgeEarnedAt: { color: colors.success, marginTop: 6, fontSize: 12, fontWeight: '700' },
    badgeStatus: {
      alignSelf: 'flex-start',
      borderRadius: colors.radiusPill,
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeStatusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    emptyText: { color: colors.muted, lineHeight: 20 },
    ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    ctaButton: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      padding: 14,
      alignItems: 'center',
    },
    ctaButtonSecondary: {
      backgroundColor: colors.bgSoft,
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    ctaButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    ctaButtonTextSecondary: { color: colors.accentStrong },
    refreshButton: { padding: 16, alignItems: 'center' },
    refreshText: { color: colors.accent, fontWeight: '700' },
  });
}
