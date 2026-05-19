import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WEB_URL } from '../../config';
import { formatTrack, getBadgeVisual, getTrackVisual } from '../../lib/design';
import {
  CourseDetail,
  CourseModule,
  CourseProgressData,
  CourseProgressModule,
  completeModule,
  fetchCourse,
  fetchCourseProgress,
} from '../../services/courses';

type ModuleStatus = 'completed' | 'in_progress' | 'todo';

type SuccessNotice = {
  badges: string[];
  gameScore: number;
  moduleTitle: string;
  pointsEarned: number;
  quizScore: number;
};

export function CourseDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const courseSlug = typeof slug === 'string' ? slug : '';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<SuccessNotice | null>(null);
  const [localResult, setLocalResult] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    if (!courseSlug) {
      setError('Parcours introuvable.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [courseResult, progressResult] = await Promise.all([
        fetchCourse(courseSlug),
        fetchCourseProgress(courseSlug),
      ]);
      setCourse(courseResult.data);
      setProgress(progressResult.data);
      setSource(courseResult.source === 'api' && progressResult.source === 'api' ? 'api' : 'demo');
      const nextId = progressResult.data.progress.nextModule?.id ?? null;
      setExpandedModuleId(nextId);
    } catch {
      setError('Impossible de charger ce parcours.');
      setCourse(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const moduleProgressById = useMemo(() => {
    return new Map(progress?.modules.map((module) => [module.id, module]) ?? []);
  }, [progress]);

  const canSubmit = useMemo(() => {
    if (!expandedModuleId || !course) return false;
    const module = course.modules.find((item) => item.id === expandedModuleId);
    if (!module?.questions.length) return false;
    return module.questions.every((question) => answers[question.id]);
  }, [answers, course, expandedModuleId]);

  async function handleSubmit(module: CourseModule) {
    if (!module.questions.length) return;

    setSubmitting(true);
    setSuccessNotice(null);
    setLocalResult(null);

    const localScore = computeLocalScore(module.questions, answers);

    if (source === 'api' && !module.id.startsWith('demo-')) {
      try {
        const result = await completeModule(module.id, {
          quizAnswers: answers,
          gameOrder: module.game?.steps.map((step) => step.id),
        });
        const refreshed = await fetchCourseProgress(courseSlug);
        const courseJustCompleted =
          result.courseCompleted ||
          refreshed.data.progress.progressPercent >= 100 ||
          !refreshed.data.progress.nextModule;

        if (courseJustCompleted) {
          const completion = result.courseCompletion ?? {
            slug: courseSlug,
            title: course?.title ?? refreshed.data.course.title,
            pointsEarned: sumModuleProgressPoints(refreshed.data.modules),
            badgeEarned: result.badges?.find((badge) =>
              ['apple-mdm-foundation', 'jamf-engineer', 'intune-professional'].includes(badge)
            ),
          };
          router.replace({
            pathname: '/course/[slug]/complete',
            params: {
              slug: courseSlug,
              title: completion.title,
              pointsEarned: String(completion.pointsEarned),
              badgeEarned: completion.badgeEarned ?? '',
              usesDemo: '0',
            },
          });
          setSubmitting(false);
          return;
        }

        setSuccessNotice({
          badges: result.badges ?? [],
          gameScore: result.gameScore,
          moduleTitle: module.title,
          pointsEarned: result.pointsEarned,
          quizScore: result.quizScore,
        });
        setAnswers({});
        setProgress(refreshed.data);
        setExpandedModuleId(refreshed.data.progress.nextModule?.id ?? null);
        setSubmitting(false);
        return;
      } catch {
        setLocalResult(
          `Score local : ${localScore} %. L’enregistrement a échoué — réessayez ou continuez sur le web.`
        );
        setSubmitting(false);
        return;
      }
    }

    setLocalResult(
      `Score local : ${localScore} %. Connecte-toi avec l’API pour enregistrer la progression.`
    );
    setSubmitting(false);
  }

  function openWebCourse() {
    void Linking.openURL(`${WEB_URL}/courses/${courseSlug}`);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0070D2" />
        <Text style={styles.loadingText}>Chargement du parcours…</Text>
      </View>
    );
  }

  if (error || !course || !progress) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{error ?? 'Parcours introuvable'}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const visual = getTrackVisual(course.track);
  const percent = progress.progress.progressPercent;
  const nextModuleId = progress.progress.nextModule?.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Tableau de bord</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: visual.gradient[0] }]}>
        <Text style={styles.heroIcon}>{visual.icon}</Text>
        <Text style={styles.heroTrack}>{formatTrack(course.track)}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        {course.description ? <Text style={styles.heroDescription}>{course.description}</Text> : null}
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>
            {progress.progress.completedModules}/{progress.progress.totalModules} modules · {percent} %
          </Text>
        </View>
        <ProgressBar progress={percent} fillColor="#FFCE5B" trackColor="rgba(255,255,255,0.22)" />
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connecte-toi pour synchroniser la progression avec l’API.
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Modules du parcours</Text>
        <Text style={styles.sectionHint}>3 unités · statut en temps réel</Text>
      </View>

      <View style={styles.moduleStrip}>
        {course.modules.map((module, index) => {
          const moduleProgress = moduleProgressById.get(module.id);
          const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
          return (
            <View
              key={module.id}
              style={[
                styles.stripItem,
                status === 'completed'
                  ? styles.stripCompleted
                  : status === 'in_progress'
                    ? styles.stripInProgress
                    : styles.stripTodo,
              ]}
            >
              <Text style={styles.stripIndex}>Module {index + 1}</Text>
              <Text style={styles.stripTitle} numberOfLines={2}>
                {module.title}
              </Text>
              <Text style={styles.stripStatus}>{moduleStatusLabel(status)}</Text>
            </View>
          );
        })}
      </View>

      {successNotice ? (
        <View style={styles.successBanner}>
          <Text style={styles.successEyebrow}>🎉 Unité terminée</Text>
          <Text style={styles.successTitle}>
            Bravo ! « {successNotice.moduleTitle} » est complétée.
          </Text>
          <Text style={styles.successMeta}>
            Quiz {successNotice.quizScore} % · mini-scénario {successNotice.gameScore} % · +
            {successNotice.pointsEarned} points
          </Text>
          {successNotice.badges.length > 0 ? (
            <View style={styles.badgeRow}>
              {successNotice.badges.map((badgeSlug) => {
                const badge = getBadgeVisual(badgeSlug);
                return (
                  <View key={badgeSlug} style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}

      {course.modules.map((module, index) => {
        const moduleProgress = moduleProgressById.get(module.id);
        const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
        const isExpanded = expandedModuleId === module.id;
        const hasQuestions = module.questions.length > 0;
        const canPlayHere = hasQuestions && (status === 'in_progress' || isExpanded);

        return (
          <View
            key={module.id}
            style={[
              styles.moduleCard,
              status === 'completed' ? styles.moduleCardCompleted : null,
            ]}
          >
            <Pressable
              onPress={() => setExpandedModuleId(isExpanded ? null : module.id)}
              style={styles.moduleHeader}
            >
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleIndex}>Module {index + 1}</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSummary}>{module.summary}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  status === 'completed'
                    ? styles.statusCompleted
                    : status === 'in_progress'
                      ? styles.statusInProgress
                      : styles.statusTodo,
                ]}
              >
                <Text style={styles.statusPillText}>{moduleStatusLabel(status)}</Text>
              </View>
            </Pressable>

            {isExpanded ? (
              <View style={styles.moduleBody}>
                {canPlayHere ? (
                  <>
                    {module.questions.map((question) => (
                      <View key={question.id} style={styles.questionBlock}>
                        <Text style={styles.questionPrompt}>{question.prompt}</Text>
                        {question.options.map((option) => {
                          const selected = answers[question.id] === option.id;
                          return (
                            <Pressable
                              key={option.id}
                              onPress={() =>
                                setAnswers((current) => ({ ...current, [question.id]: option.id }))
                              }
                              style={[styles.option, selected ? styles.optionSelected : null]}
                            >
                              <Text
                                style={[styles.optionText, selected ? styles.optionTextSelected : null]}
                              >
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                    {localResult ? <Text style={styles.localResult}>{localResult}</Text> : null}
                    <Pressable
                      disabled={!canSubmit || submitting}
                      onPress={() => void handleSubmit(module)}
                      style={[styles.primaryButton, !canSubmit || submitting ? styles.buttonDisabled : null]}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Valider le module</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.webFallback}>
                    <Text style={styles.webFallbackText}>
                      {hasQuestions
                        ? 'Ce module est verrouillé ou nécessite le web pour le mini-scénario complet.'
                        : 'Les questions de ce module ne sont pas disponibles hors ligne.'}
                    </Text>
                    <Pressable style={styles.secondaryButton} onPress={openWebCourse}>
                      <Text style={styles.secondaryButtonText}>Continuer sur le web →</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Besoin du parcours complet ?</Text>
        <Text style={styles.footerText}>
          Quiz avancés, mini-scénarios MDM et badges détaillés sont disponibles sur la version web.
        </Text>
        <Pressable style={styles.secondaryButton} onPress={openWebCourse}>
          <Text style={styles.secondaryButtonText}>Ouvrir sur le web</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => void loadCourse()} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir la progression</Text>
      </Pressable>
    </ScrollView>
  );
}

function getModuleStatus(
  moduleId: string,
  moduleProgress: CourseProgressModule | undefined,
  nextModuleId?: string | null
): ModuleStatus {
  if (moduleProgress?.completed) return 'completed';
  if (moduleId === nextModuleId) return 'in_progress';
  return 'todo';
}

function moduleStatusLabel(status: ModuleStatus) {
  if (status === 'completed') return 'Terminé';
  if (status === 'in_progress') return 'En cours';
  return 'À faire';
}

function sumModuleProgressPoints(
  modules: { completed: boolean; quizScore: number | null; gameScore: number | null }[]
) {
  return modules
    .filter((module) => module.completed)
    .reduce(
      (sum, module) =>
        sum + Math.round((module.quizScore ?? 0) * 0.1 + (module.gameScore ?? 0) * 0.2),
      0
    );
}

function computeLocalScore(questions: CourseModule['questions'], answers: Record<string, string>) {
  if (!questions.length) return 0;
  const correct = questions.filter(
    (question) => question.correctOption && answers[question.id] === question.correctOption
  );
  return Math.round((correct.length / questions.length) * 100);
}

function ProgressBar({
  progress,
  fillColor = '#34C759',
  trackColor = '#E5E5EA',
}: {
  progress: number;
  fillColor?: string;
  trackColor?: string;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F7', padding: 24 },
  loadingText: { marginTop: 12, color: '#6E6E73' },
  errorTitle: { color: '#1D1D1F', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  backButton: { marginTop: 16, padding: 12 },
  backButtonText: { color: '#0070D2', fontWeight: '700' },
  backLink: { marginBottom: 12 },
  backLinkText: { color: '#0070D2', fontWeight: '700' },
  heroCard: { borderRadius: 24, padding: 20, marginBottom: 16 },
  heroIcon: { fontSize: 28, marginBottom: 8 },
  heroTrack: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroDescription: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
  heroMeta: { marginTop: 12, marginBottom: 10 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  demoBanner: { backgroundColor: '#FFF7E6', borderRadius: 14, padding: 12, marginBottom: 16 },
  demoText: { color: '#8A5A00', lineHeight: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { color: '#1D1D1F', fontSize: 20, fontWeight: '800' },
  sectionHint: { color: '#6E6E73', marginTop: 2, fontSize: 13 },
  moduleStrip: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stripItem: { flex: 1, borderRadius: 14, padding: 10, borderWidth: 1 },
  stripCompleted: { backgroundColor: '#F4FBF6', borderColor: '#A8D8B2' },
  stripInProgress: { backgroundColor: '#FFF8E6', borderColor: '#F0CF7A' },
  stripTodo: { backgroundColor: '#F8FAFD', borderColor: '#E5E5EA' },
  stripIndex: { color: '#6E6E73', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  stripTitle: { color: '#1D1D1F', fontWeight: '700', fontSize: 12, marginTop: 4, minHeight: 32 },
  stripStatus: { color: '#0070D2', fontSize: 11, fontWeight: '800', marginTop: 6 },
  successBanner: {
    backgroundColor: '#F4FBF6',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#A8D8B2',
    padding: 16,
    marginBottom: 16,
  },
  successEyebrow: { color: '#1F7A3A', fontWeight: '800', fontSize: 13 },
  successTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800', marginTop: 6 },
  successMeta: { color: '#6E6E73', marginTop: 6, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  moduleCardCompleted: { borderColor: '#A8D8B2', backgroundColor: '#FCFFFD' },
  moduleHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  moduleHeaderText: { flex: 1 },
  moduleIndex: { color: '#6E6E73', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  moduleTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800', marginTop: 2 },
  moduleSummary: { color: '#6E6E73', marginTop: 4, lineHeight: 20 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusCompleted: { backgroundColor: '#E9F8EE' },
  statusInProgress: { backgroundColor: '#FFF7D6' },
  statusTodo: { backgroundColor: '#F5F5F7' },
  statusPillText: { fontSize: 11, fontWeight: '800', color: '#1D1D1F' },
  moduleBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  questionBlock: { marginBottom: 14 },
  questionPrompt: { color: '#1D1D1F', fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  option: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFC',
  },
  optionSelected: { borderColor: '#0070D2', backgroundColor: '#EAF3FF' },
  optionText: { color: '#1D1D1F', lineHeight: 20 },
  optionTextSelected: { color: '#0066CC', fontWeight: '700' },
  localResult: { color: '#8A5A00', marginBottom: 10, lineHeight: 20 },
  primaryButton: {
    backgroundColor: '#0070D2',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  buttonDisabled: { opacity: 0.5 },
  webFallback: { gap: 10 },
  webFallbackText: { color: '#6E6E73', lineHeight: 20 },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5DBF3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: '#0070D2', fontWeight: '700' },
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  footerTitle: { color: '#1D1D1F', fontSize: 17, fontWeight: '800' },
  footerText: { color: '#6E6E73', marginTop: 6, lineHeight: 20, marginBottom: 12 },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: '#0070D2', fontWeight: '700' },
});
