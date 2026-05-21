import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandIcon } from '../../components/BrandIcon';
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const GITHUB_REPO_URL = 'https://github.com/khafpro2/khafscool';

const PILLARS = [
  {
    track: 'APPLE' as const,
    brand: 'apple' as const,
    title: 'Apple Device Support',
    description:
      'Support des appareils, diagnostic, sécurité et fondamentaux de gestion pour flottes iOS et macOS.',
  },
  {
    track: 'JAMF' as const,
    brand: 'jamf' as const,
    title: 'Jamf Pro',
    description:
      'Administration Jamf, inventaire, smart groups et politiques MDM — exercices courts et scénarios terrain.',
  },
  {
    track: 'INTUNE' as const,
    brand: 'microsoft' as const,
    title: 'Microsoft Intune',
    description:
      'Enrôlement Apple via Intune, conformité, profils et bonnes pratiques Microsoft Endpoint Manager.',
  },
];

export function AboutScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const heroGradient = getTrackVisual('DEFAULT').gradient;

  function openGitHub() {
    void Linking.openURL(GITHUB_REPO_URL);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: heroGradient[0] }]}>
        <Text style={styles.heroEyebrow}>{'\u{1F393}'} MDM Academy Pro</Text>
        <Text style={styles.heroTitle}>Former les pros Apple et MDM, gratuitement.</Text>
        <Text style={styles.heroText}>
          MDM Academy est une plateforme de formation gamifiée pour techniciens et administrateurs qui
          gèrent des flottes Apple. Notre mission : rendre accessibles Apple Device Support, Jamf Pro et
          Microsoft Intune — sans abonnement, sans limite.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionEyebrow}>Notre approche</Text>
      <Text style={styles.sectionTitle}>Trois piliers, un même objectif</Text>
      <Text style={styles.sectionHint}>
        Chaque piste combine quiz, mini-jeux et scénarios de 10 à 15 minutes. Tu progresses à ton rythme
        avec badges, quêtes hebdo et sprints certification.
      </Text>

      <View style={styles.pillarList}>
        {PILLARS.map((pillar) => {
          const visual = getTrackVisual(pillar.track);
          return (
            <View key={pillar.track} style={styles.pillarCard}>
              <View style={styles.pillarHead}>
                <BrandIcon brand={pillar.brand} size="md" />
                <TrackIcon track={pillar.track} size="sm" />
                <View style={styles.pillarBadge}>
                  <Text style={styles.pillarBadgeText}>{visual.label}</Text>
                </View>
              </View>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.pillarDescription}>{pillar.description}</Text>
              <Text style={styles.pillarTrackMeta}>{formatTrack(pillar.track)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.softCard}>
        <Text style={styles.sectionEyebrow}>Équipe & vision</Text>
        <Text style={styles.cardTitle}>Des praticiens MDM pour des praticiens MDM</Text>
        <Text style={styles.cardText}>
          Nous sommes une équipe de formateurs et administrateurs MDM qui enseignent au quotidien le support
          Apple et la gestion de parc. Notre vision : un parcours clair, ludique et 100 % gratuit — du premier
          diagnostic iPhone au déploiement Jamf ou Intune en entreprise.
        </Text>
        <Text style={styles.disclaimer}>
          MDM Academy n’est pas affilié à Apple Inc., Jamf ou Microsoft. Les contenus pédagogiques sont
          originaux ; consulte les sources officielles avant un examen ou une décision de conformité.
        </Text>
      </View>

      <View style={styles.softCard}>
        <Text style={styles.sectionEyebrow}>Contact & communauté</Text>
        <Text style={styles.cardTitle}>Un projet open source, 100 % gratuit</Text>
        <Text style={styles.cardText}>
          MDM Academy Pro reste gratuit pour tous les techniciens et administrateurs MDM. Le code source est
          public : signale un bug, propose une amélioration ou contribue aux parcours pédagogiques.
        </Text>
        <Pressable style={styles.secondaryButton} onPress={openGitHub}>
          <Text style={styles.secondaryButtonText}>Voir le dépôt GitHub</Text>
        </Pressable>
      </View>

      <View style={[styles.ctaCard, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
        <Text style={styles.cardTitle}>Prêt à t&apos;exercer ?</Text>
        <Text style={styles.cardText}>
          Choisis une piste Apple, Jamf ou Intune et débloque tes premiers badges dès aujourd&apos;hui.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    backButton: { marginBottom: 12 },
    backText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    hero: {
      borderRadius: colors.radiusLg,
      padding: 20,
      marginBottom: 24,
    },
    heroEyebrow: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '800',
      marginTop: 8,
      lineHeight: 30,
    },
    heroText: {
      color: 'rgba(255,255,255,0.88)',
      marginTop: 10,
      lineHeight: 22,
      fontSize: 15,
    },
    primaryButton: {
      marginTop: 16,
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    secondaryButton: {
      marginTop: 14,
      alignSelf: 'flex-start',
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusMd,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: { color: colors.fg, fontWeight: '800', fontSize: 15 },
    sectionEyebrow: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionTitle: { color: colors.fg, fontSize: 22, fontWeight: '800', marginTop: 6 },
    sectionHint: { color: colors.muted, marginTop: 6, marginBottom: 16, lineHeight: 21, fontSize: 14 },
    pillarList: { gap: 12, marginBottom: 20 },
    pillarCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillarHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    pillarBadge: {
      backgroundColor: colors.bg,
      borderRadius: colors.radiusPill,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillarBadgeText: { color: colors.fg, fontSize: 12, fontWeight: '700' },
    pillarTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginTop: 12 },
    pillarDescription: { color: colors.muted, marginTop: 6, lineHeight: 21, fontSize: 14 },
    pillarTrackMeta: { color: colors.accent, marginTop: 8, fontSize: 12, fontWeight: '700' },
    softCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { color: colors.fg, fontSize: 18, fontWeight: '800', marginTop: 6 },
    cardText: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 14 },
    disclaimer: { color: colors.muted, marginTop: 10, lineHeight: 20, fontSize: 12 },
    ctaCard: {
      borderRadius: colors.radiusLg,
      padding: 16,
      borderWidth: 1,
    },
  });
}
