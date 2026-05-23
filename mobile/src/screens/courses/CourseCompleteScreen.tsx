import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WEB_URL } from '../../config';
import { BrandIcon } from '../../components/BrandIcon';
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { estimatePoints, formatTrack, getBadgeVisual, getTrackVisual, inferLevelFromModules } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { CourseSlug } from '@ama/shared/learning-paths';
import { NEXT_COURSE_BY_SLUG, QUESTIONS_PER_MODULE } from '@ama/shared/constants';
import { formatCourseHeroBanner, sumLessonReadingMinutes } from '@ama/shared/reading-time';
import { fetchCourse, fetchCourseProgress } from '../../services/courses';

const MOTIVATIONAL_MESSAGES = [
  'Tu viens de franchir une étape majeure — la suite t’attend avec confiance.',
  'Chaque unité validée te rapproche d’un profil MDM crédible sur le terrain.',
  'Garde ce rythme : la régularité bat le talent ponctuel.',
  'Ton parcours est complet — transforme cette victoire en habitude.',
  'Les flottes Apple, Jamf et Intune n’ont plus de secrets pour toi sur ce socle.',
];

const CONFETTI_PIECES = ['\u{1F389}', '\u2B50', '\u{1F3C6}', '\u2728', '\u{1F34F}', '\u{1F6E1}'];

export function CourseCompleteScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
  const nextCourse = useMemo(() => NEXT_COURSE_BY_SLUG[slug as CourseSlug] ?? null, [slug]);
  const motivationalLine = useMemo(() => pickMotivationalMessage(slug), [slug]);
  const [moduleCount, setModuleCount] = useState(4);
  const [validatedModules, setValidatedModules] = useState<{ title: string }[]>([]);
  const [totalReadingMinutes, setTotalReadingMinutes] = useState(0);
  const level = inferLevelFromModules(moduleCount);
  const estimatedTotal = estimatePoints(moduleCount, level);
  const displayPoints = pointsEarned > 0 ? pointsEarned : estimatedTotal;
  const totalQuestions = moduleCount * QUESTIONS_PER_MODULE;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    void (async () => {
      try {
        const { data: course } = await fetchCourse(slug);
        if (cancelled) return;
        const readingMinutes = sumLessonReadingMinutes(
          course.modules.map((module) => module.lessonContent ?? '')
        );
        setModuleCount(course.modules.length);
        setTotalReadingMinutes(readingMinutes);

        try {
          const progress = await fetchCourseProgress(slug);
          if (cancelled) return;
          const validated = progress.data.modules
            .filter((module) => module.completed)
            .map((module) => ({ title: module.title }));
          setValidatedModules(
            validated.length > 0
              ? validated
              : course.modules.map((module) => ({ title: module.title }))
          );
        } catch {
          setValidatedModules(course.modules.map((module) => ({ title: module.title })));
        }
      } catch {
        if (!cancelled) {
          setModuleCount(4);
          setValidatedModules([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heroScale = useRef(new Animated.Value(0.96)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, heroScale]);

  function openCertificate() {
    void Linking.openURL(`${WEB_URL}/courses/${slug}/certificate`);
  }

  function openWebComplete() {
    void Linking.openURL(`${WEB_URL}/courses/${slug}/complete`);
  }

  async function shareCertificate() {
    const url = `${WEB_URL}/courses/${slug}/certificate`;
    const intro = `Mon certificat « ${title} » sur Apple MDM Academy.`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: intro, url, title: 'Certificat MDM Academy' }
          : { message: `${intro} ${url}`, title: 'Certificat MDM Academy' }
      );
    } catch {
      // Annulation ou partage indisponible
    }
  }

  async function shareSuccess() {
    const url = `${WEB_URL}/courses/${slug}/complete`;
    const intro = `J'ai complété le parcours « ${title} » sur Apple MDM Academy.`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? {
              message: intro,
              url,
              title: 'Parcours terminé — MDM Academy',
            }
          : {
              message: `${intro} ${url}`,
              title: 'Parcours terminé — MDM Academy',
            }
      );
    } catch {
      // Annulation ou partage indisponible
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.animationLayer} pointerEvents="none">
        <ConfettiLayer />
        <SparkleLayer />
      </View>

      <Animated.View
        style={[
          styles.hero,
          { backgroundColor: visual.gradient[0], opacity: heroOpacity, transform: [{ scale: heroScale }] },
        ]}
      >
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{'\u{1F389}'} Parcours terminé</Text>
        </View>
        <TrackIcon track={track} size="lg" style={{ marginBottom: 10 }} />
        <Text style={styles.heroTitle}>Bravo ! Tu as complété « {title} »</Text>
        <Text style={styles.heroText}>
          Tu viens de boucler les {moduleCount} unités du parcours {formatTrack(track)} — {totalQuestions}{' '}
          questions validées au total. Continue sur la lancée !
        </Text>
        <Text style={styles.heroMotivation}>{motivationalLine}</Text>
        {usesDemo ? (
          <Text style={styles.demoHint}>
            Mode démo — connectez-vous sur le web pour enregistrer votre progression.
          </Text>
        ) : null}
      </Animated.View>

      <View style={styles.recapCard}>
        <Text style={styles.recapTitle}>Récapitulatif du parcours</Text>
        <View style={styles.recapGrid}>
          <View style={styles.recapMetric}>
            <Text style={styles.recapLabel}>Modules validés</Text>
            <Text style={styles.recapValue}>
              {validatedModules.length}/{moduleCount}
            </Text>
          </View>
          <View style={styles.recapMetric}>
            <Text style={styles.recapLabel}>Temps de lecture</Text>
            <Text style={styles.recapValue}>~{totalReadingMinutes} min de lecture</Text>
          </View>
          <View style={styles.recapMetric}>
            <Text style={styles.recapLabel}>Questions quiz</Text>
            <Text style={styles.recapValue}>{totalQuestions}</Text>
            <Text style={styles.recapHint}>{QUESTIONS_PER_MODULE} par module</Text>
          </View>
        </View>
        {validatedModules.length > 0 ? (
          <View style={styles.moduleList}>
            {validatedModules.map((module) => (
              <Text key={module.title} style={styles.moduleListItem}>
                {'\u2705'} {module.title}
              </Text>
            ))}
          </View>
        ) : null}
        <Text style={styles.heroBannerHint}>
          {formatCourseHeroBanner(moduleCount, totalReadingMinutes, QUESTIONS_PER_MODULE)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Points gagnés sur le parcours</Text>
          <Text style={styles.statValue}>+{displayPoints} pts</Text>
          <Text style={styles.statHint}>
            Estimation catalogue : jusqu’à {estimatedTotal} pts pour ce parcours {level.toLowerCase()}.
          </Text>
        </View>
        <View style={[styles.statCard, styles.badgeCard]}>
          <Text style={styles.statLabel}>Super-badge débloqué</Text>
          {badgeVisual ? (
            <View style={styles.badgeRow}>
              <View style={[styles.badgeIconWrap, { backgroundColor: badgeVisual.bg }]}>
                {badgeVisual.brand ? (
                  <BrandIcon brand={badgeVisual.brand} size="md" />
                ) : (
                  <Text style={styles.badgeIcon}>{badgeVisual.icon}</Text>
                )}
              </View>
              <View style={styles.badgeCopy}>
                <Text style={[styles.badgeLabel, { color: badgeVisual.color }]}>{badgeVisual.label}</Text>
                <Text style={styles.badgeHint}>Ajouté à ta collection MDM Academy.</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.statMuted}>Badge en cours de déblocage</Text>
          )}
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Et maintenant ?</Text>
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={openCertificate}>
            <Text style={styles.primaryButtonText}>{'\u{1F4DC}'} Voir mon certificat</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => void shareCertificate()}>
            <Text style={styles.secondaryButtonText}>Partager mon certificat</Text>
          </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/course/${slug}/revision`)}>
          <Text style={styles.secondaryButtonText}>{'\u{1F4D1}'} Fiche révision</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void Linking.openURL(`${WEB_URL}/courses/${slug}/examen`)}>
          <Text style={styles.secondaryButtonText}>{'\u{1F4DD}'} Examen blanc</Text>
        </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => void shareSuccess()}>
            <Text style={styles.secondaryButtonText}>Partager ma réussite</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={openWebComplete}>
            <Text style={styles.ghostButtonText}>Voir la célébration sur le web</Text>
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
      </View>

      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Revoir le parcours</Text>
      </Pressable>
    </ScrollView>
  );
}

function pickMotivationalMessage(slug: string) {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash + slug.charCodeAt(index) * (index + 1)) % MOTIVATIONAL_MESSAGES.length;
  }
  return MOTIVATIONAL_MESSAGES[hash] ?? MOTIVATIONAL_MESSAGES[0];
}

function ConfettiLayer() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 14 }).map((_, index) => (
        <ConfettiPiece
          key={index}
          emoji={CONFETTI_PIECES[index % CONFETTI_PIECES.length]}
          left={`${(index * 17) % 100}%`}
          delay={index * 120}
          duration={2800 + (index % 4) * 400}
        />
      ))}
    </View>
  );
}

function ConfettiPiece({
  emoji,
  left,
  delay,
  duration,
}: {
  emoji: string;
  left: `${number}%`;
  delay: number;
  duration: number;
}) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 420,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: duration - 300, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(translateY, { toValue: -40, duration: 0, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left,
        top: 0,
        fontSize: 16 + (delay % 3) * 4,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

function SparkleLayer() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Sparkle key={index} left={`${8 + (index * 11) % 84}%`} top={`${12 + (index % 4) * 16}%`} delay={index * 350} />
      ))}
    </View>
  );
}

function Sparkle({ left, top, delay }: { left: `${number}%`; top: `${number}%`; delay: number }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#ffffff',
        opacity,
      }}
    />
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    animationLayer: {
      ...StyleSheet.absoluteFillObject,
      height: 320,
      overflow: 'hidden',
    },
    hero: { borderRadius: 24, padding: 20, marginBottom: 16, overflow: 'hidden' },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 8,
    },
    heroBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 4 },
    heroText: { color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 22 },
    heroMotivation: {
      color: 'rgba(255,255,255,0.98)',
      marginTop: 10,
      lineHeight: 22,
      fontWeight: '700',
      fontSize: 15,
    },
    demoHint: {
      marginTop: 12,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.18)',
      color: '#FFFFFF',
      fontSize: 13,
    },
    statsRow: { gap: 12, marginBottom: 16 },
    recapCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    recapTitle: { color: colors.fg, fontSize: 18, fontWeight: '800' },
    recapGrid: { gap: 12, marginTop: 12 },
    recapMetric: {},
    recapLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    recapValue: { color: colors.fg, fontSize: 24, fontWeight: '900', marginTop: 4 },
    recapHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
    moduleList: { marginTop: 12, gap: 6 },
    moduleListItem: { color: colors.fg, fontWeight: '600', lineHeight: 22 },
    heroBannerHint: { color: colors.muted, marginTop: 12, fontSize: 13, fontWeight: '700' },
    statCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeCard: { backgroundColor: colors.demoBannerBg, borderColor: colors.demoBannerBorder },
    statLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: { color: colors.fg, fontSize: 28, fontWeight: '900', marginTop: 6 },
    statHint: { color: colors.muted, marginTop: 6, lineHeight: 18, fontSize: 13 },
    statMuted: { color: colors.muted, marginTop: 8 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    badgeIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeIcon: { fontSize: 24 },
    badgeCopy: { flex: 1 },
    badgeLabel: { fontWeight: '800', fontSize: 15 },
    badgeHint: { color: colors.muted, marginTop: 4, fontSize: 13 },
    actionsCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    actionsTitle: { color: colors.fg, fontSize: 18, fontWeight: '800' },
    actions: { gap: 10, marginTop: 12 },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
    secondaryButton: {
      backgroundColor: colors.bg,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: { color: colors.accent, fontWeight: '800' },
    ghostButton: { padding: 12, alignItems: 'center' },
    ghostButtonText: { color: colors.muted, fontWeight: '700' },
    nextCard: {
      marginTop: 16,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    nextEyebrow: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    nextTitle: { color: colors.fg, fontSize: 18, fontWeight: '800', marginTop: 6 },
    nextHint: { color: colors.muted, marginTop: 4, lineHeight: 20 },
    nextButton: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    nextButtonText: { color: '#FFFFFF', fontWeight: '700' },
    footerNote: { color: colors.muted, lineHeight: 20, marginTop: 16 },
    backLink: { padding: 12, alignItems: 'center' },
    backLinkText: { color: colors.accent, fontWeight: '700' },
  });
}
