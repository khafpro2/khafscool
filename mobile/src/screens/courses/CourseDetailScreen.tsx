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
import { TrackIcon } from '../../components/TrackIcon';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { formatTrack, getTrackVisual } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { toastBadgeUnlocked, toastModuleCompleted } from '../../lib/gamification-toasts';
import { LessonContent } from '../../components/LessonContent';
import { ModuleVideoSection } from '../../components/ModuleVideoSection';
import { moduleHasVideo } from '@ama/shared/video-embed';
import { ModuleObjectives } from '../../components/ModuleObjectives';
import { QUESTIONS_PER_MODULE } from '@ama/shared/constants';
import { countLessonWords, formatCourseHeroBanner, formatReadingTimeLabel, sumLessonReadingMinutes } from '@ama/shared/reading-time';
import { findGlossaryTermInText, glossaryMobilePath } from '@ama/shared/glossary';
import {
  getQuizOptionDisplayLetter,
  getQuizQuestionTypeMeta,
  listIncorrectQuestionIds,
  truncateQuizPrompt,
  withShuffledQuizOptions,
} from '@ama/shared/quiz-learning';
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

type ModuleStatus = 'completed' | 'in_progress' | 'locked';

const QUIZ_PASS_PERCENT = 50;

function modulePointsFromScores(quizScore: number, gameScore: number) {
  return Math.round(quizScore * 0.1 + gameScore * 0.2);
}

export function CourseDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const courseSlug = typeof slug === 'string' ? slug : '';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [source, setSource] = useState<'api' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const activeModuleRef = React.useRef<View>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, CheckAnswerResult>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizFocusWrongOnly, setQuizFocusWrongOnly] = useState(false);
  const [quizLearningTipDismissed, setQuizLearningTipDismissed] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    if (!course) return null;
    const nextId = progress?.progress.nextModule?.id;
    const targetId = expandedModuleId ?? nextId;
    const module =
      (targetId ? course.modules.find((item) => item.id === targetId) : null) ??
      course.modules[0] ??
      null;
    if (!module) return null;
    return {
      ...module,
      questions: withShuffledQuizOptions(module.questions),
    };
  }, [course, expandedModuleId, progress?.progress.nextModule?.id]);

  useEffect(() => {
    if (!activeModule || loading) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 420, animated: true });
    });
  }, [activeModule?.id, loading]);

  useEffect(() => {
    setQuizQuestionIndex(0);
    setQuizFocusWrongOnly(false);
    setQuizFeedback(null);
  }, [activeModule?.id]);

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

  async function handleSubmit(module: CourseModule, review = false) {
    if (!module.questions.length) return;

    setSubmitting(true);
    setLocalResult(null);

    const estimatedQuizScore = computeQuizScorePercent(module.questions.length, questionResults);

    if (source === 'api' && !module.id.startsWith('demo-')) {
      try {
        const result = await completeModule(module.id, {
          quizAnswers: answers,
          gameOrder: module.game?.steps.map((step) => step.id),
          ...(review ? { reviewMode: true } : {}),
        });

        if (review || result.reviewMode) {
          setLocalResult(`Mode révision — score ${result.quizScore}%. Aucun point enregistré.`);
          resetQuizState(module);
          setSubmitting(false);
          return;
        }

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

        toastModuleCompleted(
          module.title,
          result.pointsEarned,
          result.quizScore,
          result.gameScore
        );
        for (const badgeSlug of result.badges ?? []) {
          toastBadgeUnlocked(badgeSlug);
        }
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

    if (review) {
      setLocalResult(`Mode révision — score local ${estimatedQuizScore}%. Aucun point enregistré.`);
      resetQuizState(module);
      setSubmitting(false);
      return;
    }

    setLocalResult(
      `Score quiz estimé : ${estimatedQuizScore} %. Connecte-toi avec l’API pour enregistrer la progression.`
    );
    setSubmitting(false);
  }

  function selectModule(moduleId: string) {
    const module = course?.modules.find((item) => item.id === moduleId);
    if (!module) return;
    const moduleProgress = moduleProgressById.get(moduleId);
    const status = getModuleStatus(moduleId, moduleProgress, progress?.progress.nextModule?.id);
    if (status === 'locked') return;
    if (expandedModuleId !== moduleId) {
      resetQuizState(module);
    }
    setExpandedModuleId(moduleId);
  }

  function openWebCourse() {
    void Linking.openURL(`${WEB_URL}/courses/${courseSlug}`);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
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
  const totalReadingMinutes = sumLessonReadingMinutes(
    course.modules.map((module) => module.lessonContent ?? '')
  );
  const heroBanner = formatCourseHeroBanner(
    progress.progress.totalModules,
    totalReadingMinutes,
    QUESTIONS_PER_MODULE
  );

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Tableau de bord</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: visual.gradient[0] }]}>
        <TrackIcon track={course.track} size="lg" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTrack}>{formatTrack(course.track)}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        {course.description ? <Text style={styles.heroDescription}>{course.description}</Text> : null}
        <Text style={styles.heroBanner}>{heroBanner}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>
            {progress.progress.completedModules}/{progress.progress.totalModules} unités · {percent} %
          </Text>
        </View>
        <ProgressBar progress={percent} fillColor={colors.warning} trackColor="rgba(255,255,255,0.22)" styles={styles} />
        <Pressable onPress={() => router.push('/glossary')} style={styles.glossaryLink}>
          <Text style={styles.glossaryLinkText}>Glossaire MDM →</Text>
        </Pressable>
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
        <Text style={styles.sectionHint}>
          {progress.progress.totalModules} unités · statut en temps réel
        </Text>
      </View>

      <View style={styles.moduleStrip}>
        {course.modules.map((module, index) => {
          const moduleProgress = moduleProgressById.get(module.id);
          const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
          const isActive = activeModule?.id === module.id;
          return (
            <Pressable
              key={module.id}
              disabled={status === 'locked'}
              onPress={() => selectModule(module.id)}
              style={[
                styles.stripItem,
                isActive ? styles.stripActive : null,
                status === 'completed'
                  ? styles.stripCompleted
                  : status === 'in_progress'
                    ? styles.stripInProgress
                    : styles.stripLocked,
              ]}
            >
              <Text style={styles.stripIndex}>Unité {index + 1}</Text>
              <Text style={styles.stripTitle} numberOfLines={2}>
                {module.title}
              </Text>
              <Text style={styles.stripStatus}>
                {moduleStatusIcon(status)} {moduleStatusLabel(status)}
              </Text>
              {moduleHasVideo(module) ? (
                <Text style={styles.stripVideoBadge}>{'\u{1F3AC}'} Vidéo</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {activeModule ? (() => {
        const module = activeModule;
        const moduleIndex = course.modules.findIndex((item) => item.id === module.id);
        const moduleProgress = moduleProgressById.get(module.id);
        const status = getModuleStatus(module.id, moduleProgress, nextModuleId);
        const isLocked = status === 'locked';
        const isReviewMode = status === 'completed';
        const hasQuestions = module.questions.length > 0;
        const canPlayHere = hasQuestions && !isLocked;
        const readingLabel = module.lessonContent
          ? formatReadingTimeLabel(countLessonWords(module.lessonContent))
          : null;

        return (
          <View
            ref={activeModuleRef}
            style={[
              styles.moduleCard,
              status === 'completed' ? styles.moduleCardCompleted : null,
              isLocked ? styles.moduleCardLocked : null,
            ]}
          >
            <View style={styles.moduleHeader}>
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleIndex}>Unité {moduleIndex + 1}</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSummary}>{module.summary}</Text>
                {readingLabel ? (
                  <View style={styles.readingBadge}>
                    <Text style={styles.readingBadgeText}>{readingLabel}</Text>
                  </View>
                ) : null}
                <ModuleObjectives
                  learningObjectives={module.learningObjectives}
                  keyTakeaways={module.keyTakeaways}
                />
                {moduleProgress?.completedAt ? (
                  <Text style={styles.moduleCompletedAt}>
                    Terminée le {new Date(moduleProgress.completedAt).toLocaleDateString('fr-FR')}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.statusPill,
                  status === 'completed'
                    ? styles.statusCompleted
                    : status === 'in_progress'
                      ? styles.statusInProgress
                      : styles.statusLocked,
                ]}
              >
                <Text style={styles.statusPillText}>
                  {moduleStatusIcon(status)} {moduleStatusLabel(status)}
                  {moduleProgress?.score != null ? ` · ${moduleProgress.score}%` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.moduleBody}>
              {isLocked ? (
                <View style={styles.lockedBox}>
                  <Text style={styles.lockedText}>
                    Termine l'unité précédente pour débloquer le quiz ({module.questions.length}{' '}
                    question{module.questions.length > 1 ? 's' : ''}).
                  </Text>
                </View>
              ) : canPlayHere ? (
                  <>
                    {isReviewMode ? (
                      <View style={styles.reviewBanner}>
                        <Text style={styles.reviewBannerTitle}>{'\u{1F504}'} Mode révision — aucun point</Text>
                        <Text style={styles.reviewBannerText}>
                          Refais le quiz pour t&apos;entraîner sans modifier ta progression.
                        </Text>
                      </View>
                    ) : null}
                    <ModuleVideoSection
                      courseSlug={courseSlug}
                      videoUrl={module.videoUrl}
                      videoTitle={module.videoTitle}
                      videoDurationMinutes={module.videoDurationMinutes}
                      videoProvider={module.videoProvider}
                      videoSourceLanguage={module.videoSourceLanguage}
                      videoTranscriptFr={module.videoTranscriptFr}
                      videoHeyGenFrUrl={module.videoHeyGenFrUrl}
                      videoDubFrUrl={module.videoDubFrUrl}
                      moduleTitle={module.title}
                    />
                    {module.lessonContent ? (
                      <ScrollView
                        style={styles.lessonScroll}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator
                      >
                        <LessonContent content={module.lessonContent} />
                      </ScrollView>
                    ) : null}
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
                      const allRevealed = module.questions.every((item) =>
                        revealedQuestions.has(item.id)
                      );
                      const incorrectIds = listIncorrectQuestionIds(
                        module.questions.map((item) => item.id),
                        questionResults
                      );
                      const wrongIndices = incorrectIds
                        .map((id) => module.questions.findIndex((item) => item.id === id))
                        .filter((index) => index >= 0);

                      const wrongReviewPosition =
                        quizFocusWrongOnly && wrongIndices.length > 0
                          ? wrongIndices.indexOf(safeIndex) + 1
                          : 0;
                      const goToNextWrong = () => {
                        if (!wrongIndices.length) return;
                        const pos = wrongIndices.indexOf(safeIndex);
                        const nextIndex =
                          pos < 0
                            ? wrongIndices[0]
                            : wrongIndices[(pos + 1) % wrongIndices.length];
                        setQuizQuestionIndex(nextIndex);
                        setQuizFeedback(null);
                      };

                      return (
                        <View style={styles.quizStepper}>
                          {!quizLearningTipDismissed && !allRevealed ? (
                            <View style={styles.quizLearningTip}>
                              <Text style={styles.quizLearningTipTitle}>
                                {'\u{1F9E0}'} Comment tirer le meilleur de ce quiz
                              </Text>
                              <Text style={styles.quizLearningTipItem}>
                                • Une question à la fois — lis l’explication avant la suivante.
                              </Text>
                              <Text style={styles.quizLearningTipItem}>
                                • Les badges indiquent le type (scénario, dépannage, concept).
                              </Text>
                              <Text style={styles.quizLearningTipItem}>
                                • En cas d’erreur, la bonne réponse s’affiche pour ancrer le savoir.
                              </Text>
                              <Pressable
                                onPress={() => setQuizLearningTipDismissed(true)}
                                style={styles.quizLearningTipBtn}
                              >
                                <Text style={styles.quizLearningTipBtnText}>Compris</Text>
                              </Pressable>
                            </View>
                          ) : null}
                          {quizFocusWrongOnly && wrongIndices.length > 0 ? (
                            <View style={styles.quizWrongFocusBanner}>
                              <Text style={styles.quizWrongFocusText}>
                                Révision ciblée : erreur {wrongReviewPosition}/{wrongIndices.length}
                              </Text>
                              <Pressable onPress={() => setQuizFocusWrongOnly(false)}>
                                <Text style={styles.quizWrongFocusExit}>Voir tout le quiz</Text>
                              </Pressable>
                            </View>
                          ) : null}
                          <View style={styles.quizHeaderRow}>
                            <Text style={styles.quizScoreLive}>
                              {correctCount}/{total} bonnes réponses
                            </Text>
                            <Text style={styles.quizStepLabel}>
                              {quizFocusWrongOnly && wrongIndices.length > 0
                                ? `Erreur ${wrongReviewPosition}/${wrongIndices.length} · Q${safeIndex + 1}/${total}`
                                : `Question ${safeIndex + 1}/${total}`}
                            </Text>
                          </View>
                          <ProgressBar
                            progress={Math.round(((safeIndex + 1) / total) * 100)}
                            fillColor={visual.color}
                            styles={styles}
                          />
                          <View style={styles.questionBlock}>
                            {(() => {
                              const typeMeta = getQuizQuestionTypeMeta(question.type);
                              return (
                                <>
                                  <Text style={styles.quizTypeBadge}>
                                    {typeMeta.icon} {typeMeta.shortLabel}
                                  </Text>
                                  <Text style={styles.quizTypeTip}>{typeMeta.tip}</Text>
                                </>
                              );
                            })()}
                            <Text style={styles.questionPrompt}>{question.prompt}</Text>
                            {question.options.map((option, optionIndex) => {
                              const selected = selectedOption === option.id;
                              const isWrongSelection =
                                revealed && selected && checkResult?.correct === false;
                              const isCorrectSelection =
                                revealed && selected && checkResult?.correct === true;
                              const revealedCorrectId =
                                checkResult?.correctOptionId ??
                                (isWrongSelection && question.correctOption
                                  ? question.correctOption
                                  : undefined);
                              const isRevealedCorrect =
                                revealed &&
                                revealedCorrectId &&
                                option.id === revealedCorrectId &&
                                !isCorrectSelection;

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
                                        : isRevealedCorrect
                                          ? styles.optionRevealCorrect
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
                            {revealed &&
                            checkResult?.correct === false &&
                            (checkResult.correctOptionId ?? question.correctOption) ? (
                              <Text style={styles.quizCorrectAnswerHint}>
                                La bonne réponse est l’option{' '}
                                <Text style={styles.quizCorrectAnswerHintStrong}>
                                  {getQuizOptionDisplayLetter(
                                    question.options,
                                    checkResult.correctOptionId ?? question.correctOption ?? ''
                                  ) ??
                                    (checkResult.correctOptionId ?? question.correctOption ?? '').toUpperCase()}
                                </Text>{' '}
                                — relis l’explication ci-dessous.
                              </Text>
                            ) : null}
                            {revealed && checkResult?.explanation ? (
                              <View
                                style={[
                                  styles.explanationBox,
                                  checkResult.correct === false ? styles.explanationBoxEmphasis : null,
                                ]}
                              >
                                <Text style={styles.explanationTitle}>
                                  {checkResult.correct === false ? '💡 Pourquoi ?' : '💡 Explication'}
                                </Text>
                                <Text style={styles.explanationText}>{checkResult.explanation}</Text>
                                {(() => {
                                  const glossaryTerm = findGlossaryTermInText(
                                    `${question.prompt} ${checkResult.explanation ?? ''}`
                                  );
                                  if (!glossaryTerm) return null;
                                  return (
                                    <Pressable
                                      onPress={() =>
                                        router.push(glossaryMobilePath(glossaryTerm.id) as '/glossary')
                                      }
                                      style={styles.quizGlossaryLink}
                                    >
                                      <Text style={styles.quizGlossaryLinkText}>
                                        Voir dans le glossaire →
                                      </Text>
                                    </Pressable>
                                  );
                                })()}
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
                            {quizFocusWrongOnly && wrongIndices.length > 0 ? (
                              <Pressable
                                disabled={!revealed}
                                onPress={goToNextWrong}
                                style={[styles.quizNavBtnPrimary, !revealed ? styles.buttonDisabled : null]}
                              >
                                <Text style={styles.quizNavBtnPrimaryText}>Erreur suivante</Text>
                              </Pressable>
                            ) : !isLast ? (
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
                              <Text style={styles.quizFinishHint}>
                                {isReviewMode ? 'Quiz terminé — termine la révision ci-dessous' : 'Quiz terminé — valide l’unité ci-dessous'}
                              </Text>
                            ) : (
                              <Pressable disabled style={styles.quizNavBtnPrimary}>
                                <Text style={styles.quizNavBtnPrimaryText}>Suivant</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })()}
                    {(() => {
                      if (!module.questions.length) return null;
                      const quizAllRevealed = module.questions.every((item) =>
                        revealedQuestions.has(item.id)
                      );
                      const quizIncorrectIds = listIncorrectQuestionIds(
                        module.questions.map((item) => item.id),
                        questionResults
                      );
                      const quizWrongIndices = quizIncorrectIds
                        .map((id) => module.questions.findIndex((item) => item.id === id))
                        .filter((index) => index >= 0);

                      return (
                        <>
                          {quizAllRevealed && quizWrongIndices.length > 0 && !quizFocusWrongOnly ? (
                            <Pressable
                              style={styles.quizRetryWrongBtn}
                              onPress={() => {
                                setQuizFocusWrongOnly(true);
                                setQuizQuestionIndex(quizWrongIndices[0]);
                                setQuizFeedback(null);
                              }}
                            >
                              <Text style={styles.quizRetryWrongBtnText}>
                                Revoir mes {quizWrongIndices.length} erreur
                                {quizWrongIndices.length > 1 ? 's' : ''}
                              </Text>
                            </Pressable>
                          ) : null}
                          {quizAllRevealed ? (
                            <QuizRecap
                              correctCount={
                                Object.values(questionResults).filter((r) => r.correct).length
                              }
                              totalQuestions={module.questions.length}
                              estimatedScore={computeQuizScorePercent(
                                module.questions.length,
                                questionResults
                              )}
                              estimatedPoints={modulePointsFromScores(
                                computeQuizScorePercent(module.questions.length, questionResults),
                                module.game ? 100 : 0
                              )}
                              passPercent={QUIZ_PASS_PERCENT}
                              keyTakeaways={module.keyTakeaways}
                              wrongQuestions={module.questions.filter((item) =>
                                quizIncorrectIds.includes(item.id)
                              )}
                              onReviewQuestion={(questionId) => {
                                const index = module.questions.findIndex(
                                  (item) => item.id === questionId
                                );
                                if (index >= 0) {
                                  setQuizFocusWrongOnly(false);
                                  setQuizQuestionIndex(index);
                                  setQuizFeedback(null);
                                }
                              }}
                              styles={styles}
                              colors={colors}
                            />
                          ) : null}
                        </>
                      );
                    })()}
                    {localResult ? <Text style={styles.localResult}>{localResult}</Text> : null}
                    <Pressable
                      disabled={!canSubmit || submitting}
                      onPress={() => void handleSubmit(module, isReviewMode)}
                      style={[styles.primaryButton, !canSubmit || submitting ? styles.buttonDisabled : null]}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          {isReviewMode ? 'Terminer la révision' : 'Valider l’unité'}
                        </Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.webFallback}>
                    <Text style={styles.webFallbackText}>
                      Les questions de cette unité ne sont pas disponibles hors ligne.
                    </Text>
                    <Pressable style={styles.secondaryButton} onPress={openWebCourse}>
                      <Text style={styles.secondaryButtonText}>Continuer sur le web →</Text>
                    </Pressable>
                  </View>
                )}
            </View>
          </View>
        );
      })() : null}

      <Pressable
        style={styles.supportHintRow}
        onPress={() => router.push({ pathname: '/donate', params: { amount: '5' } })}
        accessibilityRole="link"
      >
        <Text style={styles.supportHintText}>
          Ce contenu vous aide ?{' '}
          <Text style={styles.supportHintLink}>Soutenir le projet</Text>
        </Text>
      </Pressable>

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
  return 'locked';
}

function moduleStatusLabel(status: ModuleStatus) {
  if (status === 'completed') return 'Terminé';
  if (status === 'in_progress') return 'En cours';
  return 'Verrouillé';
}

function moduleStatusIcon(status: ModuleStatus) {
  if (status === 'completed') return '\u2705';
  if (status === 'in_progress') return '\u25B6';
  return '\u{1F512}';
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

function QuizRecap({
  correctCount,
  totalQuestions,
  estimatedScore,
  estimatedPoints,
  passPercent,
  keyTakeaways,
  wrongQuestions,
  onReviewQuestion,
  styles,
  colors,
}: {
  correctCount: number;
  totalQuestions: number;
  estimatedScore: number;
  estimatedPoints: number;
  passPercent: number;
  keyTakeaways?: string[];
  wrongQuestions: { id: string; prompt: string }[];
  onReviewQuestion: (questionId: string) => void;
  styles: ReturnType<typeof createStyles>;
  colors: AppThemeColors;
}) {
  const minCorrect = Math.ceil((passPercent / 100) * totalQuestions);
  const meetsMinimum = estimatedScore >= passPercent;

  return (
    <View
      style={[
        styles.quizRecap,
        meetsMinimum ? styles.quizRecapSuccess : styles.quizRecapWarning,
      ]}
    >
      <Text style={[styles.quizRecapTitle, { color: colors.fg }]}>
        Récapitulatif avant validation de l'unité
      </Text>
      <Text style={[styles.quizRecapBody, { color: colors.muted }]}>
        {correctCount}/{totalQuestions} bonnes réponses · score quiz {estimatedScore}%
        {estimatedPoints > 0 ? ` · +${estimatedPoints} points estimés` : ''}
        {totalQuestions > 0
          ? ` · objectif recommandé ${minCorrect}/${totalQuestions} (${passPercent}%+)`
          : ''}
      </Text>
      {!meetsMinimum ? (
        <Text style={styles.quizRecapHint}>
          Tu peux valider l'unité, mais revoir les explications améliorera ton score.
        </Text>
      ) : null}
      {wrongQuestions.length > 0 ? (
        <View style={styles.quizRecapWrongList}>
          <Text style={styles.quizRecapWrongTitle}>À revoir avant de valider</Text>
          {wrongQuestions.map((question) => (
            <View key={question.id} style={styles.quizRecapWrongRow}>
              <Text style={styles.quizRecapWrongPrompt} numberOfLines={2}>
                {truncateQuizPrompt(question.prompt, 60)}
              </Text>
              <Pressable onPress={() => onReviewQuestion(question.id)}>
                <Text style={styles.quizRecapWrongLink}>Revoir</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {!meetsMinimum && keyTakeaways && keyTakeaways.length > 0 ? (
        <View style={styles.quizRecapTakeaways}>
          <Text style={styles.quizRecapTakeawaysTitle}>Rappel — points clés de la leçon</Text>
          {keyTakeaways.slice(0, 3).map((item) => (
            <Text key={item} style={styles.quizRecapTakeawayItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ProgressBar({
  progress,
  fillColor,
  trackColor,
  styles,
}: {
  progress: number;
  fillColor?: string;
  trackColor?: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={[styles.progressTrack, trackColor ? { backgroundColor: trackColor } : null]}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor ?? '#34C759' }]} />
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  loadingText: { marginTop: 12, color: colors.muted },
  errorTitle: { color: colors.fg, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  backButton: { marginTop: 16, padding: 12 },
  backButtonText: { color: colors.accent, fontWeight: '700' },
  backLink: { marginBottom: 12 },
  backLinkText: { color: colors.accent, fontWeight: '700' },
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
  heroBanner: {
    color: 'rgba(255,255,255,0.98)',
    marginTop: 10,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 20,
  },
  heroMeta: { marginTop: 12, marginBottom: 10 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  glossaryLink: { marginTop: 10, alignSelf: 'flex-start' },
  glossaryLinkText: { color: '#FFCE5B', fontWeight: '800', fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.border },
  progressFill: { height: '100%', borderRadius: 999 },
  demoBanner: { backgroundColor: colors.demoBannerBg, borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.demoBannerBorder },
  demoText: { color: colors.demoBannerText, lineHeight: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
  sectionHint: { color: colors.muted, marginTop: 2, fontSize: 13 },
  moduleStrip: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stripItem: { flex: 1, borderRadius: 14, padding: 10, borderWidth: 1 },
  stripActive: { borderWidth: 2, borderColor: colors.accent },
  stripCompleted: { backgroundColor: colors.accentTealSoft, borderColor: colors.success },
  stripInProgress: { backgroundColor: colors.demoBannerBg, borderColor: colors.demoBannerBorder },
  stripLocked: { backgroundColor: colors.bg, borderColor: colors.border, opacity: 0.88 },
  stripIndex: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  stripTitle: { color: colors.fg, fontWeight: '700', fontSize: 12, marginTop: 4, minHeight: 32 },
  stripStatus: { color: colors.accent, fontSize: 11, fontWeight: '800', marginTop: 6 },
  stripVideoBadge: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: 4 },
  moduleCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleCardCompleted: { borderColor: colors.success, backgroundColor: colors.accentTealSoft },
  moduleCardLocked: { opacity: 0.92 },
  moduleHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  moduleHeaderText: { flex: 1 },
  moduleIndex: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  moduleTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', marginTop: 2 },
  moduleSummary: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  readingBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readingBadgeText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  lessonScroll: {
    maxHeight: 220,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
  },
  lessonEyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  lessonText: { color: colors.fg, fontSize: 14, lineHeight: 21 },
  moduleCompletedAt: { color: colors.muted, marginTop: 6, fontSize: 12 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusCompleted: { backgroundColor: colors.accentTealSoft },
  statusInProgress: { backgroundColor: colors.demoBannerBg },
  statusLocked: { backgroundColor: colors.bg },
  statusPillText: { fontSize: 11, fontWeight: '800', color: colors.fg },
  moduleBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  lockedBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedText: { color: colors.muted, lineHeight: 20 },
  completedBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedEyebrow: { color: colors.success, fontWeight: '800', fontSize: 13 },
  completedMeta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  reviewBanner: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  reviewBannerTitle: { color: colors.fg, fontWeight: '800', fontSize: 14 },
  reviewBannerText: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 13 },
  questionBlock: { marginBottom: 14 },
  questionPrompt: { color: colors.fg, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  quizStepper: { gap: 10 },
  quizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizScoreLive: { fontWeight: '800', color: colors.fg, fontSize: 13 },
  quizStepLabel: { color: colors.muted, fontWeight: '700', fontSize: 12 },
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
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bgSoft,
  },
  quizNavBtnText: { color: colors.accent, fontWeight: '700' },
  quizNavBtnPrimary: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.accent,
  },
  quizNavBtnPrimaryText: { color: '#FFFFFF', fontWeight: '800' },
  quizFinishHint: { flex: 1, textAlign: 'right', color: colors.muted, fontSize: 12, fontWeight: '600' },
  quizFeedback: { marginTop: 8, fontWeight: '700', fontSize: 14 },
  quizFeedbackSuccess: { color: colors.success },
  quizFeedbackError: { color: colors.warning },
  quizRecap: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quizRecapSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  quizRecapWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  quizRecapTitle: { fontWeight: '800', fontSize: 15 },
  quizRecapBody: { marginTop: 6, fontSize: 13, lineHeight: 19 },
  quizRecapHint: { marginTop: 8, fontSize: 13, color: '#92400e', lineHeight: 18 },
  quizRetryWrongBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignSelf: 'flex-start',
  },
  quizRetryWrongBtnText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  quizRecapWrongList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  quizRecapWrongTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.fg,
    marginBottom: 6,
  },
  quizRecapWrongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  quizRecapWrongPrompt: {
    flex: 1,
    fontSize: 12,
    color: colors.muted,
  },
  quizRecapWrongLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.bg,
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '800',
    fontSize: 12,
    color: colors.muted,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft, borderWidth: 2 },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.accentTealSoft },
  optionIncorrect: { borderColor: colors.warning, backgroundColor: colors.demoBannerBg },
  optionRevealCorrect: { borderColor: colors.success, backgroundColor: colors.accentTealSoft },
  quizTypeBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
  },
  quizTypeTip: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 10,
  },
  quizLearningTip: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  quizLearningTipTitle: { fontWeight: '800', color: colors.fg, fontSize: 14 },
  quizLearningTipItem: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  quizLearningTipBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizLearningTipBtnText: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  quizWrongFocusBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.demoBannerBg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  quizWrongFocusText: { flex: 1, color: colors.fg, fontSize: 13, fontWeight: '600' },
  quizWrongFocusExit: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  quizCorrectAnswerHint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.warning,
    lineHeight: 18,
  },
  quizCorrectAnswerHintStrong: { fontWeight: '800', color: colors.fg },
  explanationBoxEmphasis: {
    borderColor: colors.warning,
    backgroundColor: colors.demoBannerBg,
  },
  quizRecapTakeaways: { marginTop: 12, gap: 4 },
  quizRecapTakeawaysTitle: { fontWeight: '800', color: colors.fg, fontSize: 13 },
  quizRecapTakeawayItem: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  optionText: { flex: 1, color: colors.fg, lineHeight: 20 },
  optionTextSelected: { color: colors.accent, fontWeight: '700' },
  optionTextSuccess: { color: colors.success, fontWeight: '700' },
  optionTextError: { color: colors.warning, fontWeight: '700' },
  checkButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkButtonText: { color: colors.accent, fontWeight: '700' },
  explanationBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explanationTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  explanationText: { color: colors.fg, marginTop: 4, lineHeight: 20 },
  quizGlossaryLink: { marginTop: 10, alignSelf: 'flex-start' },
  quizGlossaryLinkText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  localResult: { color: colors.demoBannerText, marginBottom: 10, lineHeight: 20 },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  buttonDisabled: { opacity: 0.5 },
  webFallback: { gap: 10 },
  webFallbackText: { color: colors.muted, lineHeight: 20 },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: colors.accent, fontWeight: '700' },
  supportHintRow: {
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
  },
  supportHintText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  supportHintLink: {
    color: colors.accent,
    fontWeight: '700',
  },
  footerCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
  footerText: { color: colors.muted, marginTop: 6, lineHeight: 20, marginBottom: 12 },
  refreshButton: { padding: 16, alignItems: 'center' },
  refreshText: { color: colors.accent, fontWeight: '700' },
  });
}
