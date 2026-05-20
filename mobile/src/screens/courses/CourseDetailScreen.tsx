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
import { BrandIcon } from '../../components/BrandIcon';
import { TrackIcon } from '../../components/TrackIcon';
import { formatTrack, getBadgeVisual, getTrackVisual } from '../../lib/design';
import {
  CheckAnswerResult,
  CourseDetail,
  CourseModule,
  CourseProgressData,
  CourseProgressModule,
  checkModuleAnswer,
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
  const [questionResults, setQuestionResults] = useState<Record<string, CheckAnswerResult>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
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

  const activeModule = useMemo(() => {
    if (!expandedModuleId || !course) return null;
    return course.modules.find((item) => item.id === expandedModuleId) ?? null;
  }, [course, expandedModuleId]);

  const canSubmit = useMemo(() => {
    if (!activeModule?.questions.length) return false;
    return activeModule.questions.every(
      (question) => answers[question.id] && revealedQuestions.has(question.id)
    );
  }, [activeModule, answers, revealedQuestions]);

  const CORRECT_MESSAGES = [
    'Bien joué !',
    'Excellent choix !',
    'Tu maîtrises ce point.',
  ];
  const INCORRECT_MESSAGES = [
    'Presque — relis l’explication.',
    'Pas tout à fait, mais tu progresses.',
  ];

  function resetQuizState(module: CourseModule) {
    setQuizQuestionIndex(0);
    setQuizFeedback(null);
    const questionIds = module.questions.map((question) => question.id);
    setAnswers((current) => {
      const next = { ...current };
      for (const questionId of questionIds) {
        delete next[questionId];
      }
      return next;
    });
    setQuestionResults((current) => {
      const next = { ...current };
      for (const questionId of questionIds) {
        delete next[questionId];
      }
      return next;
    });
    setRevealedQuestions((current) => {
      const next = new Set(current);
      for (const questionId of questionIds) {
        next.delete(questionId);
      }
      return next;
    });
  }

  async function handleCheckAnswer(module: CourseModule, questionId: string) {
    const selectedOption = answers[questionId];
    if (!selectedOption || revealedQuestions.has(questionId)) return;

    setCheckingQuestionId(questionId);
    try {
      let result: CheckAnswerResult;
      if (source === 'api' && !module.id.startsWith('demo-')) {
        result = await checkModuleAnswer(module.id, { questionId, selectedOption });
      } else {
        setLocalResult('Connecte-toi pour valider tes réponses avec l’API.');
        return;
      }
      setQuestionResults((current) => ({ ...current, [questionId]: result }));
      setRevealedQuestions((current) => new Set(current).add(questionId));
      setQuizFeedback(
        result.correct
          ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
          : INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)]
      );
      setLocalResult(null);
    } catch {
      setLocalResult('Impossible de vérifier cette réponse. Réessaie ou continue sur le web.');
    } finally {
      setCheckingQuestionId(null);
    }
  }

  async function handleSubmit(module: CourseModule) {
    if (!module.questions.length) return;

    setSubmitting(true);
    setSuccessNotice(null);
    setLocalResult(null);

    const estimatedQuizScore = computeQuizScorePercent(module.questions.length, questionResults);

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
        resetQuizState(module);
        setProgress(refreshed.data);
        setExpandedModuleId(refreshed.data.progress.nextModule?.id ?? null);
        setSubmitting(false);
        return;
      } catch {
        setLocalResult(
          `Score quiz estimé : ${estimatedQuizScore} %. L’enregistrement a échoué — réessayez ou continuez sur le web.`
        );
        setSubmitting(false);
        return;
      }
    }

    setLocalResult(
      `Score quiz estimé : ${estimatedQuizScore} %. Connecte-toi avec l’API pour enregistrer la progression.`
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
        <TrackIcon track={course.track} size="lg" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTrack}>{formatTrack(course.track)}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        {course.description ? <Text style={styles.heroDescription}>{course.description}</Text> : null}
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>
            {progress.progress.completedModules}/{progress.progress.totalModules} unités · {percent} %
          </Text>
        </View>
        <ProgressBar progress={percent} fillColor="#FFCE5B" trackColor="rgba(255,255,255,0.22)" />
      </View>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo : connectez-vous pour synchroniser la progression avec l’API.
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Unités du parcours</Text>
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
              <Text style={styles.stripIndex}>Unité {index + 1}</Text>
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
                    {badge.brand ? (
                      <BrandIcon brand={badge.brand} size="sm" />
                    ) : (
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    )}
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
              onPress={() => {
                if (isExpanded) {
                  setExpandedModuleId(null);
                  return;
                }
                resetQuizState(module);
                setExpandedModuleId(module.id);
              }}
              style={styles.moduleHeader}
            >
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleIndex}>Unité {index + 1}</Text>
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
                    {(() => {
                      const total = module.questions.length;
                      const safeIndex = Math.min(quizQuestionIndex, Math.max(0, total - 1));
                      const question = module.questions[safeIndex];
                      if (!question) return null;

                      const selectedOption = answers[question.id];
                      const checkResult = questionResults[question.id];
                      const revealed = revealedQuestions.has(question.id);
                      const correctCount = Object.values(questionResults).filter((r) => r.correct).length;
                      const isLast = safeIndex >= total - 1;

                      return (
                        <View style={styles.quizStepper}>
                          <View style={styles.quizHeaderRow}>
                            <Text style={styles.quizScoreLive}>
                              {correctCount}/{total} bonnes réponses
                            </Text>
                            <Text style={styles.quizStepLabel}>
                              Question {safeIndex + 1}/{total}
                            </Text>
                          </View>
                          <ProgressBar
                            progress={Math.round(((safeIndex + 1) / total) * 100)}
                            fillColor={visual.color}
                          />
                          <View style={styles.questionBlock}>
                            <Text style={styles.questionPrompt}>{question.prompt}</Text>
                            {question.options.map((option, optionIndex) => {
                              const selected = selectedOption === option.id;
                              const isWrongSelection =
                                revealed && selected && checkResult?.correct === false;
                              const isCorrectSelection =
                                revealed && selected && checkResult?.correct === true;

                              return (
                                <Pressable
                                  key={option.id}
                                  disabled={revealed}
                                  onPress={() => {
                                    if (revealed) return;
                                    setAnswers((current) => ({ ...current, [question.id]: option.id }));
                                    setLocalResult(null);
                                    setQuizFeedback(null);
                                  }}
                                  style={[
                                    styles.option,
                                    isCorrectSelection
                                      ? styles.optionCorrect
                                      : isWrongSelection
                                        ? styles.optionIncorrect
                                        : selected
                                          ? styles.optionSelected
                                          : null,
                                  ]}
                                >
                                  <Text style={styles.optionLetter}>
                                    {String.fromCharCode(65 + optionIndex)}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.optionText,
                                      selected ? styles.optionTextSelected : null,
                                      isCorrectSelection ? styles.optionTextSuccess : null,
                                      isWrongSelection ? styles.optionTextError : null,
                                    ]}
                                  >
                                    {option.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                            {selectedOption && !revealed ? (
                              <Pressable
                                disabled={checkingQuestionId === question.id}
                                onPress={() => void handleCheckAnswer(module, question.id)}
                                style={styles.checkButton}
                              >
                                {checkingQuestionId === question.id ? (
                                  <ActivityIndicator color="#0070D2" size="small" />
                                ) : (
                                  <Text style={styles.checkButtonText}>Valider ma réponse</Text>
                                )}
                              </Pressable>
                            ) : null}
                            {revealed && quizFeedback ? (
                              <Text
                                style={[
                                  styles.quizFeedback,
                                  checkResult?.correct ? styles.quizFeedbackSuccess : styles.quizFeedbackError,
                                ]}
                              >
                                {quizFeedback}
                              </Text>
                            ) : null}
                            {revealed && checkResult?.explanation ? (
                              <View style={styles.explanationBox}>
                                <Text style={styles.explanationTitle}>💡 Explication</Text>
                                <Text style={styles.explanationText}>{checkResult.explanation}</Text>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.quizNavRow}>
                            <Pressable
                              disabled={safeIndex === 0}
                              onPress={() => {
                                setQuizQuestionIndex(safeIndex - 1);
                                setQuizFeedback(null);
                              }}
                              style={[styles.quizNavBtn, safeIndex === 0 ? styles.buttonDisabled : null]}
                            >
                              <Text style={styles.quizNavBtnText}>Précédent</Text>
                            </Pressable>
                            {!isLast ? (
                              <Pressable
                                disabled={!revealed}
                                onPress={() => {
                                  setQuizQuestionIndex(safeIndex + 1);
                                  setQuizFeedback(null);
                                }}
                                style={[styles.quizNavBtnPrimary, !revealed ? styles.buttonDisabled : null]}
                              >
                                <Text style={styles.quizNavBtnPrimaryText}>Suivant</Text>
                              </Pressable>
                            ) : revealed ? (
                              <Text style={styles.quizFinishHint}>Quiz terminé — valide l’unité ci-dessous</Text>
                            ) : (
                              <Pressable disabled style={styles.quizNavBtnPrimary}>
                                <Text style={styles.quizNavBtnPrimaryText}>Suivant</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })()}
                    {localResult ? <Text style={styles.localResult}>{localResult}</Text> : null}
                    <Pressable
                      disabled={!canSubmit || submitting}
                      onPress={() => void handleSubmit(module)}
                      style={[styles.primaryButton, !canSubmit || submitting ? styles.buttonDisabled : null]}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Valider l’unité</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.webFallback}>
                    <Text style={styles.webFallbackText}>
                      {hasQuestions
                        ? 'Cette unité est verrouillée ou nécessite le web pour le mini-scénario complet.'
                        : 'Les questions de cette unité ne sont pas disponibles hors ligne.'}
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

function computeQuizScorePercent(
  totalQuestions: number,
  results: Record<string, CheckAnswerResult>
) {
  if (!totalQuestions) return 0;
  const correct = Object.values(results).filter((result) => result.correct).length;
  return Math.round((correct / totalQuestions) * 100);
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
  quizStepper: { gap: 10 },
  quizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizScoreLive: { fontWeight: '800', color: '#1D1D1F', fontSize: 13 },
  quizStepLabel: { color: '#6E6E73', fontWeight: '700', fontSize: 12 },
  quizNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  quizNavBtn: {
    borderWidth: 1,
    borderColor: '#C5DBF3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  quizNavBtnText: { color: '#0070D2', fontWeight: '700' },
  quizNavBtnPrimary: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0070D2',
  },
  quizNavBtnPrimaryText: { color: '#FFFFFF', fontWeight: '800' },
  quizFinishHint: { flex: 1, textAlign: 'right', color: '#6E6E73', fontSize: 12, fontWeight: '600' },
  quizFeedback: { marginTop: 8, fontWeight: '700', fontSize: 14 },
  quizFeedbackSuccess: { color: '#2F7A45' },
  quizFeedbackError: { color: '#A23D3D' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFC',
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EEF0F5',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '800',
    fontSize: 12,
    color: '#6E6E73',
  },
  optionSelected: { borderColor: '#0070D2', backgroundColor: '#EAF3FF', borderWidth: 2 },
  optionCorrect: { borderColor: '#6FBF84', backgroundColor: '#E8F7EC' },
  optionIncorrect: { borderColor: '#E08B8B', backgroundColor: '#FDEEEE' },
  optionText: { flex: 1, color: '#1D1D1F', lineHeight: 20 },
  optionTextSelected: { color: '#0066CC', fontWeight: '700' },
  optionTextSuccess: { color: '#2F7A45', fontWeight: '700' },
  optionTextError: { color: '#B44', fontWeight: '700' },
  checkButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkButtonText: { color: '#0070D2', fontWeight: '700' },
  explanationBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C5DBF3',
  },
  explanationTitle: {
    color: '#6E6E73',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  explanationText: { color: '#1D1D1F', marginTop: 4, lineHeight: 20 },
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
