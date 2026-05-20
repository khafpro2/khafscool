import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandIcon } from '../../components/BrandIcon';
import { LEARNING_PATHS } from '../../lib/learningPaths';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { CourseSummary, fetchCourses } from '../../services/courses';

export function CoursesCatalogScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [source, setSource] = useState<'api' | 'demo'>('api');
  const [loading, setLoading] = useState(true);

  async function loadCatalog() {
    setLoading(true);
    const result = await fetchCourses();
    setCourses(result.data);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  const coursesBySlug = useMemo(() => {
    const map = new Map<string, CourseSummary>();
    for (const course of courses) {
      map.set(course.slug, course);
    }
    return map;
  }, [courses]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0070D2" />
        <Text style={styles.loadingText}>Chargement du catalogue…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MDM Academy</Text>
        <Text style={styles.title}>Apprends Apple, Jamf Pro et Intune</Text>
        <Text style={styles.subtitle}>
          Trois parcours de 3 unités — support Apple, administration Jamf et enrôlement Microsoft Intune.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : catalogue local affiché (API indisponible ou sans session).
          </Text>
        </View>
      ) : null}

      {LEARNING_PATHS.map((path) => {
        const course = coursesBySlug.get(path.slug);
        return (
          <CatalogCourseCard
            key={path.slug}
            path={path}
            course={course}
            onPress={() => router.push(`/course/${path.slug}`)}
          />
        );
      })}

      <Pressable onPress={loadCatalog} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le catalogue</Text>
      </Pressable>
    </ScrollView>
  );
}

function CatalogCourseCard({
  path,
  course,
  onPress,
}: {
  path: (typeof LEARNING_PATHS)[number];
  course?: CourseSummary;
  onPress: () => void;
}) {
  const visual = getTrackVisual(path.track);
  const moduleCount = course?.totalModules ?? path.totalModules;
  const progress = course?.progressPercent ?? 0;
  const title = course?.title ?? path.title;
  const ctaLabel =
    progress > 0 && progress < 100 ? 'Continuer ce parcours' : progress >= 100 ? 'Revoir' : 'Commencer ce parcours';

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.banner, { backgroundColor: visual.gradient[0] }]}>
        <BrandIcon brand={path.brand} size="lg" variant="onColor" />
        <Text style={styles.bannerTrack}>{formatTrack(path.track)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>
          ~{path.durationMinutes} min · {moduleCount} unités
          {progress > 0 ? ` · ${progress} % complété` : ''}
        </Text>
        <View style={styles.objectives}>
          {path.objectives.map((objective) => (
            <Text key={objective} style={styles.objectiveItem}>
              • {objective}
            </Text>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { padding: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7' },
  loadingText: { marginTop: 12, color: '#6E6E73', fontSize: 15 },
  header: { marginBottom: 20 },
  eyebrow: { color: '#0070D2', fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  title: { color: '#1D1D1F', fontSize: 26, fontWeight: '800', lineHeight: 32 },
  subtitle: { color: '#6E6E73', marginTop: 8, lineHeight: 22, fontSize: 15 },
  demoBanner: { backgroundColor: '#FFF7E6', borderRadius: 14, padding: 12, marginBottom: 16 },
  demoText: { color: '#8A5A00', lineHeight: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTrack: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  cardBody: { padding: 16 },
  cardTitle: { color: '#1D1D1F', fontSize: 18, fontWeight: '800' },
  cardMeta: { color: '#6E6E73', marginTop: 6, fontSize: 13, fontWeight: '600' },
  objectives: { marginTop: 10, gap: 4 },
  objectiveItem: { color: '#6E6E73', fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 14 },
  ctaLabel: { color: '#0070D2', fontWeight: '800', fontSize: 15 },
  ctaArrow: { color: '#0070D2', fontSize: 18, fontWeight: '300' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#0070D2', fontWeight: '700' },
});
