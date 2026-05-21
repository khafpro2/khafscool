import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
  toDemoQuestions,
} from '@ama/shared/quiz-content';
import { formatTrack } from '../tracks';
import type {
  CertificationSprintDays,
  CertificationSprintSummary,
  CertificationSprintTrack,
  CourseDetail,
  CourseNextModule,
  CourseProgressData,
  CourseSummary,
  DashboardData,
  LeaderboardResponse,
  LearningStreak,
  UserBadgesResult,
  UserProgressData,
  WeeklyQuestsResponse,
} from './types';

export function startOfIsoWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy;
}

export function endOfIsoWeek(date: Date): Date {
  const start = startOfIsoWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

export function normalizeWeeklyQuests(data: WeeklyQuestsResponse): WeeklyQuestsResponse {
  const quests = Array.isArray(data?.quests) ? data.quests : [];
  const firstWeekStart = data?.weekStart ?? quests.find((quest) => quest.weekStart)?.weekStart ?? null;
  const computedStart = firstWeekStart ? new Date(firstWeekStart) : startOfIsoWeek(new Date());
  const computedEnd = data?.weekEnd ? new Date(data.weekEnd) : endOfIsoWeek(computedStart);

  return {
    quests: quests.map((quest) => ({
      ...quest,
      progress: Math.max(0, quest.progress ?? 0),
      target: Math.max(0, quest.target ?? 0),
      completed: quest.completed ?? (quest.target > 0 && quest.progress >= quest.target),
      weekStart: quest.weekStart ?? computedStart.toISOString(),
    })),
    weekStart: computedStart.toISOString(),
    weekEnd: computedEnd.toISOString(),
  };
}

export function mockUserBadges(): UserBadgesResult {
  const slugs = ['apple-mdm-foundation'];
  return {
    badges: [{ slug: 'apple-mdm-foundation', earnedAt: '2026-03-12T10:30:00.000Z' }],
    earnedSlugs: slugs,
    fromApi: false,
  };
}

export function mockWeeklyQuests(): WeeklyQuestsResponse {
  const weekStart = startOfIsoWeek(new Date()).toISOString();
  const weekEnd = endOfIsoWeek(new Date()).toISOString();

  return {
    weekStart,
    weekEnd,
    quests: [
      {
        id: 'demo-weekly-apple-2',
        questKey: 'weekly-apple-2',
        label: 'Valide 2 unités Apple',
        description: 'Renforce ton socle Device Support et MDM Apple en validant 2 unités complètes.',
        target: 2,
        progress: 1,
        completed: false,
        rewardPoints: 40,
        track: 'APPLE',
        weekStart,
      },
      {
        id: 'demo-weekly-jamf-2',
        questKey: 'weekly-jamf-2',
        label: 'Valide 2 unités Jamf Pro',
        description: 'Smart groups, politiques et inventaire : confirme tes acquis Jamf.',
        target: 2,
        progress: 2,
        completed: true,
        rewardPoints: 40,
        track: 'JAMF',
        weekStart,
      },
      {
        id: 'demo-weekly-intune-2',
        questKey: 'weekly-intune-2',
        label: 'Termine 2 unités Microsoft Intune',
        description: 'Enrôlement iOS, profils de configuration et conformité côté Microsoft.',
        target: 2,
        progress: 0,
        completed: false,
        rewardPoints: 40,
        track: 'INTUNE',
        weekStart,
      },
      {
        id: 'demo-weekly-mdm-4',
        questKey: 'weekly-mdm-4',
        label: 'Termine 4 unités MDM (toutes pistes)',
        description: 'Avance sur Apple, Jamf ou Intune pour décrocher le bonus hebdo.',
        target: 4,
        progress: 2,
        completed: false,
        rewardPoints: 80,
        track: null,
        weekStart,
      },
    ],
  };
}

export function mockLeaderboard(): LeaderboardResponse {
  return {
    leaderboard: [
      {
        rank: 1,
        displayName: 'Camille — Apple Pro',
        points: 980,
        level: 'EXPERT',
        badges: ['apple-mdm-foundation', 'jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 2,
        displayName: 'Yanis — Jamf Lead',
        points: 845,
        level: 'EXPERT',
        badges: ['jamf-engineer'],
        isCurrentUser: false,
      },
      {
        rank: 3,
        displayName: 'Léa — Intune Specialist',
        points: 760,
        level: 'TECHNICIAN',
        badges: ['intune-professional'],
        isCurrentUser: false,
      },
      {
        rank: 4,
        displayName: 'Technicien démo (toi)',
        points: 120,
        level: 'TECHNICIAN',
        badges: ['apple-mdm-foundation'],
        isCurrentUser: true,
      },
    ],
    currentUserRank: 4,
  };
}

export function mockDashboard(): DashboardData {
  return {
    user: { id: 'demo', displayName: 'Technicien démo', email: 'demo@ama.dev' },
    stats: {
      points: 120,
      level: 'TECHNICIAN',
      modulesCompleted: 1,
      timeSpentMinutes: 12,
      averageQuizScore: 85,
      preparationScore: 72,
    },
    badges: ['apple-mdm-foundation'],
    quests: [{ id: '1', label: 'Termine 3 unités Apple cette semaine', progress: 1, target: 3 }],
    certificationSprint: mockCertificationSprint(),
    courses: [
      { id: '1', slug: 'apple-cert-prep', title: 'Parcours Apple — Device Support & MDM', track: 'APPLE', progressPercent: 33, totalModules: 3, completedModules: 1 },
      { id: '2', slug: 'jamf-pro-foundations', title: 'Fondamentaux Jamf Pro', track: 'JAMF', progressPercent: 0, totalModules: 3, completedModules: 0 },
      { id: '3', slug: 'intune-ios-enrollment', title: 'Microsoft Intune — Enrôlement iOS/iPadOS', track: 'INTUNE', progressPercent: 0, totalModules: 3, completedModules: 0 },
    ],
    completedCourses: [
      {
        slug: 'apple-cert-prep',
        title: 'Parcours Apple',
        track: 'APPLE',
        completedAt: '2026-03-12T10:30:00.000Z',
      },
    ],
    learningStreak: {
      currentDays: 2,
      longestDays: 4,
      lastActivityDate: new Date().toISOString().slice(0, 10),
    },
  };
}

export function defaultLearningStreak(): LearningStreak {
  return { currentDays: 0, longestDays: 0, lastActivityDate: null };
}

export function toDashboardData(data: UserProgressData): DashboardData {
  const appleTrack = data.tracks.find((track) => track.track === 'APPLE');

  return {
    user: data.user,
    stats: {
      points: data.progress.points,
      level: data.progress.level,
      modulesCompleted: data.progress.completedModules,
      timeSpentMinutes: data.progress.completedModules * 12,
      averageQuizScore: data.progress.averageScore,
      preparationScore: appleTrack?.progressPercent ?? data.progress.progressPercent,
    },
    badges: data.badges,
    quests: data.quests,
    certificationSprint: data.certificationSprint ?? null,
    courses: data.courses,
  };
}

export function mockCertificationSprint(
  track: CertificationSprintTrack = 'APPLE',
  days: CertificationSprintDays = 7
): CertificationSprintSummary {
  const startedAt = new Date();
  const endsAt = new Date(startedAt);
  endsAt.setDate(startedAt.getDate() + days);
  const target = 4;
  const progress = track === 'APPLE' ? 1 : 0;

  return {
    id: `demo-sprint-${track.toLowerCase()}`,
    questKey: `demo:sprint:${track}:${days}`,
    track,
    label: `Sprint certification ${formatTrack(track)} — ${days} jours`,
    days,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    target,
    progress,
    progressPercent: Math.round((progress / target) * 100),
    remainingModules: Math.max(target - progress, 0),
    completed: progress >= target,
    expired: false,
  };
}

export function mergeMvpCourses(courses: CourseSummary[]) {
  const tracks = new Set(courses.map((course) => course.track));
  const merged = [...courses];
  for (const demo of DEMO_COURSES) {
    if (!tracks.has(demo.track)) {
      merged.push(courseToSummary(demo));
    }
  }
  return merged;
}

export function courseToSummary(course: CourseDetail): CourseSummary {
  const completedModules = course.completedModules ?? 0;
  const nextModule = course.modules[completedModules] ?? course.modules.find((module) => module);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    track: course.track,
    description: course.description,
    progressPercent: course.progressPercent ?? 0,
    totalModules: course.modules.length,
    completedModules,
    nextModule: nextModule
      ? {
          id: nextModule.id,
          slug: nextModule.slug,
          title: nextModule.title,
          courseSlug: course.slug,
        }
      : null,
  };
}

export function normalizeCourse(course: CourseDetail): CourseDetail {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      questions: module.questions.map((question) => ({
        ...question,
        options: Array.isArray(question.options) ? question.options : [],
      })),
      game: module.game
        ? {
            ...module.game,
            steps: Array.isArray(module.game.steps) ? module.game.steps : [],
          }
        : null,
    })),
  };
}

export function courseToProgress(course: CourseDetail): CourseProgressData {
  const completedModules = course.completedModules ?? 0;
  const progressPercent =
    course.progressPercent ?? (course.modules.length ? Math.round((completedModules / course.modules.length) * 100) : 0);
  const completedCount = Math.round((progressPercent / 100) * course.modules.length);
  const modules = course.modules.map((module, index) => {
    const completed = index < completedCount;
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      sortOrder: index + 1,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      quizScore: completed ? 85 : null,
      gameScore: completed ? 90 : null,
      score: completed ? 88 : null,
    };
  });
  const nextModule = modules.find((module) => !module.completed) ?? null;

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      track: course.track,
      description: course.description,
      progressPercent,
      totalModules: course.modules.length,
      completedModules: completedCount,
      nextModule: nextModule ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title } : null,
    },
    progress: {
      totalModules: course.modules.length,
      completedModules: completedCount,
      progressPercent,
      averageScore: modules.some((module) => module.score !== null) ? 88 : 0,
      nextModule: nextModule ? { id: nextModule.id, slug: nextModule.slug, title: nextModule.title } : null,
    },
    modules,
  };
}
export const DEMO_COURSES: CourseDetail[] = [
  {
    id: 'demo-apple',
    slug: 'apple-cert-prep',
    title: 'Parcours Apple — Device Support & MDM',
    track: 'APPLE',
    description: 'Diagnostic, sécurité et préparation aux fondamentaux Apple Device Support.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-apple-module-1',
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary: 'Identifier une panne simple, sécuriser les données et choisir la bonne étape de support.',
        questions: toDemoQuestions(
          'device-support-basics',
          appleCertPrepQuestions['device-support-basics']
        ),
        game: {
          type: 'SCENARIO_FIX',
          scenario: 'Un MacBook affiche une roue de chargement après une mise à jour macOS.',
          steps: [
            { id: 1, label: 'Démarrer en mode sans échec' },
            { id: 2, label: 'Vérifier l’espace disque disponible' },
            { id: 3, label: 'Réinstaller macOS en conservant les données' },
          ],
          correctOrder: [2, 1, 3],
        },
      },
      {
        id: 'demo-apple-module-2',
        slug: 'ios-troubleshooting',
        title: 'Dépannage iOS et iPadOS',
        summary: 'Diagnostiquer connectivité, batterie et blocages courants sur iPhone/iPad.',
        questions: toDemoQuestions('ios-troubleshooting', appleCertPrepQuestions['ios-troubleshooting']),
        game: {
          type: 'IOS_TRIAGE',
          scenario: 'Un iPad ne synchronise plus les apps MDM. Ordonne les vérifications.',
          steps: [
            { id: 1, label: 'Confirmer Wi-Fi/cellulaire et date/heure correctes' },
            { id: 2, label: 'Vérifier profil MDM et dernière check-in dans la console' },
            { id: 3, label: 'Forcer une synchronisation ou réinstaller le profil si nécessaire' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
      {
        id: 'demo-apple-module-3',
        slug: 'acmt-exam-prep',
        title: 'Préparation examen Device Support (ACMT)',
        summary: 'Réviser sécurité, sauvegarde, restauration et bonnes pratiques atelier.',
        questions: toDemoQuestions('acmt-exam-prep', appleCertPrepQuestions['acmt-exam-prep']),
        game: {
          type: 'EXAM_RUNBOOK',
          scenario: 'Un Mac ne démarre plus après une panne d’alimentation. Ordonne les étapes de diagnostic.',
          steps: [
            { id: 1, label: 'Vérifier alimentation, câbles et prise secteur' },
            { id: 2, label: 'Lancer Apple Diagnostics et noter les codes erreur' },
            { id: 3, label: 'Documenter les résultats avant toute réparation matérielle' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
    ],
  },
  {
    id: 'demo-jamf',
    slug: 'jamf-pro-foundations',
    title: 'Fondamentaux Jamf Pro',
    track: 'JAMF',
    description: 'Découvrir inventaire, smart groups, politiques et bonnes pratiques MDM.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-jamf-module-1',
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        summary:
          'Comprendre comment cibler des Mac et déclencher une politique Jamf Pro sur un périmètre pilote.',
        questions: toDemoQuestions(
          'smart-groups-policies',
          jamfProFoundationsQuestions['smart-groups-policies']
        ),
        game: {
          type: 'POLICY_ORDER',
          scenario: 'Préparer le déploiement d’un paquet sur un groupe pilote de Mac.',
          steps: [
            { id: 1, label: 'Créer ou vérifier le Smart Group pilote' },
            { id: 2, label: 'Associer la politique au paquet' },
            { id: 3, label: 'Limiter le scope puis tester sur un Mac' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
      {
        id: 'demo-jamf-module-2',
        slug: 'inventory-basics',
        title: 'Inventaire et conformité',
        summary:
          'Lire l’inventaire Jamf, interpréter la conformité et prioriser les actions sur les appareils hors norme.',
        questions: toDemoQuestions('inventory-basics', jamfProFoundationsQuestions['inventory-basics']),
        game: {
          type: 'INVENTORY_TRIAGE',
          scenario: 'Prioriser les alertes inventaire sur un parc Mac.',
          steps: [
            { id: 1, label: 'Confirmer la gestion MDM et la dernière check-in' },
            { id: 2, label: 'Vérifier version macOS et espace disque' },
            { id: 3, label: 'Lancer une politique corrective' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
      {
        id: 'demo-jamf-module-3',
        slug: 'enrollment-apple-integration',
        title: 'Enrôlement et intégration Apple',
        summary:
          'Relier Apple Business Manager, certificats Push et enrôlement automatisé pour une flotte supervisée.',
        questions: toDemoQuestions(
          'enrollment-apple-integration',
          jamfProFoundationsQuestions['enrollment-apple-integration']
        ),
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario: 'Mettre en service 20 Mac neufs via Jamf Pro et Apple Business Manager.',
          steps: [
            { id: 1, label: 'Vérifier le jeton MDM et le certificat Push' },
            { id: 2, label: 'Assigner les appareils au serveur Jamf dans ABM' },
            { id: 3, label: 'Activer un Mac et valider l’assistant d’enrôlement' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
    ],
  },
  {
    id: 'demo-intune',
    slug: 'intune-ios-enrollment',
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    track: 'INTUNE',
    description: 'Enrôlement ADE, conformité et App Protection pour flottes Apple dans Intune.',
    progressPercent: 0,
    modules: [
      {
        id: 'demo-intune-module-1',
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        summary: 'Associer Apple Business Manager à Intune et valider l’expérience Setup Assistant.',
        questions: toDemoQuestions(
          'ade-enrollment-basics',
          intuneIosEnrollmentQuestions['ade-enrollment-basics']
        ),
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario: '30 iPad neufs dans Apple Business Manager. Ordonne les étapes pour les rendre prêts via Intune.',
          steps: [
            { id: 1, label: 'Affecter les appareils au serveur MDM Intune dans Apple Business Manager' },
            { id: 2, label: 'Créer et assigner un profil ADE dans Intune' },
            { id: 3, label: 'Démarrer un iPad et vérifier l’assistant d’enrôlement' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
      {
        id: 'demo-intune-module-2',
        slug: 'compliance-policies',
        title: 'Politiques de conformité iOS',
        summary: 'Définir conformité OS, PIN, jailbreak et actions correctives dans Intune.',
        questions: toDemoQuestions(
          'compliance-policies',
          intuneIosEnrollmentQuestions['compliance-policies']
        ),
        game: {
          type: 'COMPLIANCE_TRIAGE',
          scenario: 'Prioriser OS obsolète, PIN absent et jailbreak détecté sur trois iPhone.',
          steps: [
            { id: 1, label: 'Examiner le rapport de conformité par appareil dans Intune' },
            { id: 2, label: 'Prioriser jailbreak et appliquer blocage ou retrait du parc' },
            { id: 3, label: 'Envoyer notification de mise à jour OS ou exigence PIN' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
      {
        id: 'demo-intune-module-3',
        slug: 'app-protection-conditional-access',
        title: 'App Protection et Conditional Access',
        summary: 'Protéger les données M365 sur iOS avec MAM et Conditional Access.',
        questions: toDemoQuestions(
          'app-protection-conditional-access',
          intuneIosEnrollmentQuestions['app-protection-conditional-access']
        ),
        game: {
          type: 'MAM_POLICY_ORDER',
          scenario: 'Déployer Outlook et Teams protégés sur des iPhone BYOD.',
          steps: [
            { id: 1, label: 'Créer et assigner une politique App Protection iOS/iPadOS' },
            { id: 2, label: 'Configurer Conditional Access exigeant apps approuvées ou appareil conforme' },
            { id: 3, label: 'Valider l’accès et le conteneur de données sur un iPhone pilote' },
          ],
          correctOrder: [1, 2, 3],
        },
      },
    ],
  },
];
