import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TrackIcon } from '../../components/TrackIcon';
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
        <Text style={styles.eyebrow}>Catalogue MDM Academy</Text>
        <Text style={styles.title}>Tous les parcours</Text>
        <Text style={styles.subtitle}>
          Apple, Jamf et Intune — choisis un parcours pour commencer ou continuer.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : catalogue local affiché (API indisponible ou sans session).
          </Text>
        </View>
      ) : null}

      {courses.map((course) => (
        <CatalogCourseCard
          key={course.id}
          course={course}
          onPress={() => router.push(`/course/${course.slug}`)}
        />
      ))}

      <Pressable onPress={loadCatalog} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le catalogue</Text>
      </Pressable>
    </ScrollView>
  );
}

function CatalogCourseCard({ course, onPress }: { course: CourseSummary; onPress: () => void }) {
  const visual = getTrackVisual(course.track);
  const moduleCount = course.totalModules ?? 0;
  const progress = course.progressPercent ?? 0;
  const ctaLabel = progress > 0 && progress < 100 ? 'Continuer' : progress >= 100 ? 'Revoir' : 'Ouvrir';

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.banner, { backgroundColor: visual.gradient[0] }]}>
        <TrackIcon track={course.track} size="md" />
        <Text style={styles.bannerTrack}>{formatTrack(course.track)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{course.title}</Text>
        {course.description ? <Text style={styles.cardDesc}>{course.description}</Text> : null}
        <Text style={styles.cardMeta}>
          {moduleCount} unité{moduleCount > 1 ? 's' : ''}
          {progress > 0 ? ` · ${progress} % complété` : ''}
        </Text>
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
  title: { color: '#1D1D1F', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#6E6E73', marginTop: 8, lineHeight: 22 },
  demoBanner: { backgroundColor: '#FFF7E6', borderRadius: 14, padding: 12, marginBottom: 16 },
  demoText: { color: '#8A5A00', lineHeight: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  banner: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerIcon: { fontSize: 24 },
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
  cardDesc: { color: '#6E6E73', marginTop: 6, lineHeight: 20, fontSize: 14 },
  cardMeta: { color: '#6E6E73', marginTop: 10, fontSize: 13, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12 },
  ctaLabel: { color: '#0070D2', fontWeight: '800', fontSize: 15 },
  ctaArrow: { color: '#0070D2', fontSize: 18, fontWeight: '300' },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#0070D2', fontWeight: '700' },
});
