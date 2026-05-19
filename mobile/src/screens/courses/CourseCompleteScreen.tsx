import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WEB_URL } from '../../config';
import { BrandIcon } from '../../components/BrandIcon';
import { TrackIcon } from '../../components/TrackIcon';
import { formatTrack, getBadgeVisual, getTrackVisual } from '../../lib/design';
import { NEXT_COURSE_BY_SLUG } from '../../services/courses';

export function CourseCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    slug?: string;
    title?: string;
    pointsEarned?: string;
    badgeEarned?: string;
    usesDemo?: string;
  }>();

  const slug = typeof params.slug === 'string' ? params.slug : '';
  const title = typeof params.title === 'string' ? params.title : 'Parcours';
  const pointsEarned = Number(params.pointsEarned ?? 0) || 0;
  const badgeEarned = typeof params.badgeEarned === 'string' ? params.badgeEarned : '';
  const usesDemo = params.usesDemo === '1';
  const track = slug.includes('jamf') ? 'JAMF' : slug.includes('intune') ? 'INTUNE' : 'APPLE';
  const visual = getTrackVisual(track);
  const badgeVisual = badgeEarned ? getBadgeVisual(badgeEarned) : null;
  const nextCourse = useMemo(() => NEXT_COURSE_BY_SLUG[slug] ?? null, [slug]);

  function openWebComplete() {
    void Linking.openURL(`${WEB_URL}/courses/${slug}/complete`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: visual.gradient[0] }]}>
        <TrackIcon track={track} size="lg" style={{ marginBottom: 10 }} />
        <Text style={styles.heroEyebrow}>Parcours terminé</Text>
        <Text style={styles.heroTitle}>Bravo ! Tu as complété « {title} »</Text>
        <Text style={styles.heroText}>
          Toutes les unités du parcours {formatTrack(track)} sont validées.
        </Text>
        {usesDemo ? (
          <Text style={styles.demoHint}>
            Mode démo — connectez-vous sur le web pour enregistrer votre progression.
          </Text>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Points gagnés</Text>
          <Text style={styles.statValue}>+{pointsEarned} pts</Text>
        </View>
        <View style={[styles.statCard, styles.badgeCard]}>
          <Text style={styles.statLabel}>Super-badge</Text>
          {badgeVisual ? (
            <View style={styles.badgeRow}>
              {badgeVisual.brand ? (
                <BrandIcon brand={badgeVisual.brand} size="md" />
              ) : (
                <Text style={styles.badgeIcon}>{badgeVisual.icon}</Text>
              )}
              <Text style={[styles.badgeLabel, { color: badgeVisual.color }]}>{badgeVisual.label}</Text>
            </View>
          ) : (
            <Text style={styles.statMuted}>Badge en cours de déblocage</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={openWebComplete}>
          <Text style={styles.primaryButtonText}>Voir sur le web</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryButtonText}>Retour au tableau de bord</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.ghostButtonText}>Tous les parcours</Text>
        </Pressable>
      </View>

      {nextCourse ? (
        <View style={styles.nextCard}>
          <Text style={styles.nextEyebrow}>Parcours suggéré</Text>
          <Text style={styles.nextTitle}>{nextCourse.title}</Text>
          <Text style={styles.nextHint}>
            {slug === 'apple-cert-prep'
              ? 'Enchaîne avec Jamf Pro après ton socle Apple.'
              : 'Poursuis ta montée en compétences MDM multi-plateforme.'}
          </Text>
          <Pressable
            style={styles.nextButton}
            onPress={() => router.push(`/course/${nextCourse.slug}`)}
          >
            <Text style={styles.nextButtonText}>Commencer le parcours suivant</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.footerNote}>
          Tu as complété la trilogie Apple · Jamf · Intune. Explore les quêtes sur le web !
        </Text>
      )}

      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Revoir le parcours</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { padding: 20, paddingBottom: 40 },
  hero: { borderRadius: 24, padding: 20, marginBottom: 16 },
  heroEyebrow: { color: 'rgba(255,255,255,0.9)', fontWeight: '800', fontSize: 13 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 8 },
  heroText: { color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 22 },
  demoHint: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    color: '#FFFFFF',
    fontSize: 13,
  },
  statsRow: { gap: 12, marginBottom: 16 },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  badgeCard: { backgroundColor: '#FFF8E6', borderColor: '#F0CF7A' },
  statLabel: {
    color: '#6E6E73',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { color: '#1D1D1F', fontSize: 28, fontWeight: '900', marginTop: 6 },
  statMuted: { color: '#6E6E73', marginTop: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badgeIcon: { fontSize: 22 },
  badgeLabel: { fontWeight: '800', fontSize: 15, flex: 1 },
  actions: { gap: 10, marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#0070D2',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C5DBF3',
  },
  secondaryButtonText: { color: '#0070D2', fontWeight: '800' },
  ghostButton: { padding: 12, alignItems: 'center' },
  ghostButtonText: { color: '#6E6E73', fontWeight: '700' },
  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  nextEyebrow: {
    color: '#6E6E73',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nextTitle: { color: '#1D1D1F', fontSize: 18, fontWeight: '800', marginTop: 6 },
  nextHint: { color: '#6E6E73', marginTop: 4, lineHeight: 20 },
  nextButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#0070D2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nextButtonText: { color: '#FFFFFF', fontWeight: '700' },
  footerNote: { color: '#6E6E73', lineHeight: 20, marginBottom: 12 },
  backLink: { padding: 12, alignItems: 'center' },
  backLinkText: { color: '#0070D2', fontWeight: '700' },
});
