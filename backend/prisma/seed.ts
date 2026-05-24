import bcrypt from 'bcrypt';
import { AuthProvider, CourseTrack, Prisma, PrismaClient } from '@prisma/client';
import { DEMO_ACCOUNT } from '@ama/shared/constants';
import { getCoursePedagogy, getModulePedagogy } from '@ama/shared/course-content';
import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
  type SeedQuestion,
} from '@ama/shared/quiz-content';
import { LEARNING_PATHS } from '@ama/shared/learning-paths';

const prisma = new PrismaClient();

type SeedModule = {
  slug: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  keyTakeaways: string[];
  lessonContent: string;
  sortOrder: number;
  questions: SeedQuestion[];
  game: {
    type: string;
    scenario: string;
    steps: Prisma.InputJsonValue;
    solution: Prisma.InputJsonValue;
  };
};

async function seedModule(courseId: string, module: SeedModule) {
  const savedModule = await prisma.module.upsert({
    where: { courseId_slug: { courseId, slug: module.slug } },
    update: {
      title: module.title,
      summary: module.summary,
      learningObjectives: module.learningObjectives,
      keyTakeaways: module.keyTakeaways,
      lessonContent: module.lessonContent,
      sortOrder: module.sortOrder,
    },
    create: {
      courseId,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
      learningObjectives: module.learningObjectives,
      keyTakeaways: module.keyTakeaways,
      lessonContent: module.lessonContent,
      sortOrder: module.sortOrder,
    },
  });

  await prisma.question.deleteMany({ where: { moduleId: savedModule.id } });
  await prisma.question.createMany({
    data: module.questions.map((question) => ({
      type: question.type,
      prompt: question.prompt,
      options: question.options as Prisma.InputJsonValue,
      correctOption: question.correctOption,
      explanation: question.explanation,
      examOnly: question.examOnly ?? false,
      moduleId: savedModule.id,
    })),
  });

  await prisma.game.upsert({
    where: { moduleId: savedModule.id },
    update: {
      type: module.game.type,
      scenario: module.game.scenario,
      steps: module.game.steps,
      solution: module.game.solution,
    },
    create: {
      moduleId: savedModule.id,
      type: module.game.type,
      scenario: module.game.scenario,
      steps: module.game.steps,
      solution: module.game.solution,
    },
  });

  return savedModule;
}

async function seedCourse(course: {
  track: CourseTrack;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  modules: SeedModule[];
}) {
  const savedCourse = await prisma.course.upsert({
    where: { slug: course.slug },
    update: {
      title: course.title,
      description: course.description,
      sortOrder: course.sortOrder,
    },
    create: {
      track: course.track,
      slug: course.slug,
      title: course.title,
      description: course.description,
      sortOrder: course.sortOrder,
    },
  });

  for (const module of course.modules) {
    await seedModule(savedCourse.id, module);
  }

  return savedCourse;
}

function pathTitle(slug: string): string {
  const path = LEARNING_PATHS.find((entry) => entry.slug === slug);
  if (!path) throw new Error(`Parcours inconnu: ${slug}`);
  return path.title;
}

function modulePedagogy(courseSlug: string, moduleSlug: string) {
  const pedagogy = getModulePedagogy(courseSlug, moduleSlug);
  if (!pedagogy) throw new Error(`Contenu pédagogique manquant: ${courseSlug}/${moduleSlug}`);
  return pedagogy;
}

function courseDescription(courseSlug: string) {
  const pedagogy = getCoursePedagogy(courseSlug);
  if (!pedagogy) throw new Error(`Description parcours manquante: ${courseSlug}`);
  return pedagogy.description;
}

async function main() {
  const appleCourse = await seedCourse({
    track: CourseTrack.APPLE,
    slug: 'apple-cert-prep',
    title: pathTitle('apple-cert-prep'),
    description: courseDescription('apple-cert-prep'),
    sortOrder: 1,
    modules: [
      {
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        ...modulePedagogy('apple-cert-prep', 'device-support-basics'),
        sortOrder: 1,
        questions: appleCertPrepQuestions['device-support-basics'],
        game: {
          type: 'SCENARIO_FIX',
          scenario: 'Un MacBook affiche une roue de chargement au démarrage après une mise à jour macOS.',
          steps: [
            { id: 1, label: 'Démarrer en mode sans échec' },
            { id: 2, label: 'Vérifier l’espace disque disponible' },
            { id: 3, label: 'Réinstaller macOS en conservant les données' },
          ],
          solution: { correctOrder: [2, 1, 3] },
        },
      },
      {
        slug: 'ios-troubleshooting',
        title: 'Dépannage iOS et iPadOS',
        ...modulePedagogy('apple-cert-prep', 'ios-troubleshooting'),
        sortOrder: 2,
        questions: appleCertPrepQuestions['ios-troubleshooting'],
        game: {
          type: 'IOS_TRIAGE',
          scenario:
            'Un iPad d’élève ne synchronise plus les apps MDM et affiche « Réseau indisponible ». Ordonne les vérifications.',
          steps: [
            { id: 1, label: 'Confirmer Wi-Fi/cellulaire et date/heure correctes' },
            { id: 2, label: 'Vérifier profil MDM et dernière check-in dans la console' },
            { id: 3, label: 'Forcer une synchronisation ou réinstaller le profil si nécessaire' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'acmt-exam-prep',
        title: 'Préparation examen Device Support (ACMT)',
        ...modulePedagogy('apple-cert-prep', 'acmt-exam-prep'),
        sortOrder: 3,
        questions: appleCertPrepQuestions['acmt-exam-prep'],
        game: {
          type: 'EXAM_RUNBOOK',
          scenario:
            'Un Mac ne démarre plus après une panne d’alimentation. Ordonne les étapes de diagnostic conformes aux bonnes pratiques atelier.',
          steps: [
            { id: 1, label: 'Vérifier alimentation, câbles et prise secteur' },
            { id: 2, label: 'Lancer Apple Diagnostics et noter les codes erreur' },
            { id: 3, label: 'Documenter les résultats avant toute réparation matérielle' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'apps-vpp-management',
        title: 'Gestion des apps et VPP',
        ...modulePedagogy('apple-cert-prep', 'apps-vpp-management'),
        sortOrder: 4,
        questions: appleCertPrepQuestions['apps-vpp-management'],
        game: {
          type: 'APP_VPP_TRIAGE',
          scenario:
            'Une app VPP métier n’apparaît pas sur un iPhone supervisé après configuration. Ordonne les vérifications support L1.',
          steps: [
            { id: 1, label: 'Confirmer Wi-Fi/cellulaire et date/heure correctes' },
            { id: 2, label: 'Vérifier profil MDM et dernière check-in dans la console' },
            { id: 3, label: 'Escalader vers admin MDM avec bundle ID et tests réseau documentés' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
    ],
  });

  const jamfCourse = await seedCourse({
    track: CourseTrack.JAMF,
    slug: 'jamf-pro-foundations',
    title: pathTitle('jamf-pro-foundations'),
    description: courseDescription('jamf-pro-foundations'),
    sortOrder: 2,
    modules: [
      {
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        ...modulePedagogy('jamf-pro-foundations', 'smart-groups-policies'),
        sortOrder: 1,
        questions: jamfProFoundationsQuestions['smart-groups-policies'],
        game: {
          type: 'POLICY_ORDER',
          scenario: 'Préparer le déploiement d’un paquet sur un groupe pilote de Mac.',
          steps: [
            { id: 1, label: 'Créer ou vérifier le Smart Group pilote' },
            { id: 2, label: 'Associer la politique au paquet' },
            { id: 3, label: 'Limiter le scope puis tester sur un Mac' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'inventory-basics',
        title: 'Inventaire et conformité',
        ...modulePedagogy('jamf-pro-foundations', 'inventory-basics'),
        sortOrder: 2,
        questions: jamfProFoundationsQuestions['inventory-basics'],
        game: {
          type: 'INVENTORY_TRIAGE',
          scenario:
            'Trois Mac signalent des alertes : un disque plein, un OS obsolète, un agent MDM absent. Ordonne les vérifications.',
          steps: [
            { id: 1, label: 'Confirmer la gestion MDM et la dernière check-in' },
            { id: 2, label: 'Vérifier version macOS et espace disque' },
            { id: 3, label: 'Ouvrir un ticket ou lancer une politique corrective' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'enrollment-apple-integration',
        title: 'Enrôlement et intégration Apple',
        ...modulePedagogy('jamf-pro-foundations', 'enrollment-apple-integration'),
        sortOrder: 3,
        questions: jamfProFoundationsQuestions['enrollment-apple-integration'],
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario:
            'Une entreprise reçoit 20 Mac neufs dans Apple Business Manager. Ordonne les étapes pour les rendre gérés par Jamf Pro.',
          steps: [
            { id: 1, label: 'Vérifier le jeton MDM et le certificat Push dans Jamf Pro' },
            { id: 2, label: 'Assigner les appareils au serveur Jamf dans Apple Business Manager' },
            { id: 3, label: 'Activer un Mac et valider l’assistant d’enrôlement' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'api-automation-advanced-policies',
        title: 'Automatisation et extension API',
        ...modulePedagogy('jamf-pro-foundations', 'api-automation-advanced-policies'),
        sortOrder: 4,
        questions: jamfProFoundationsQuestions['api-automation-advanced-policies'],
        game: {
          type: 'API_AUTOMATION_RUNBOOK',
          scenario:
            'Préparer un export automatique des Mac non conformes OS avant un audit ISO.',
          steps: [
            { id: 1, label: 'Obtenir un token OAuth API Jamf avec scopes lecture inventaire' },
            { id: 2, label: 'Interroger computers-inventory avec filtres OS et check-in' },
            { id: 3, label: 'Publier le CSV et ouvrir tickets remédiation sur Smart Group' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
    ],
  });

  const intuneCourse = await seedCourse({
    track: CourseTrack.INTUNE,
    slug: 'intune-ios-enrollment',
    title: pathTitle('intune-ios-enrollment'),
    description: courseDescription('intune-ios-enrollment'),
    sortOrder: 3,
    modules: [
      {
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        ...modulePedagogy('intune-ios-enrollment', 'ade-enrollment-basics'),
        sortOrder: 1,
        questions: intuneIosEnrollmentQuestions['ade-enrollment-basics'],
        game: {
          type: 'ENROLLMENT_RUNBOOK',
          scenario:
            'Une école reçoit 30 iPad dans Apple Business Manager. Ordonne les étapes pour les rendre prêts à l’usage via Intune.',
          steps: [
            { id: 1, label: 'Affecter les appareils au serveur MDM Intune dans Apple Business Manager' },
            { id: 2, label: 'Créer et assigner un profil ADE dans Intune' },
            { id: 3, label: 'Démarrer un iPad et vérifier l’assistant d’enrôlement' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'compliance-policies',
        title: 'Politiques de conformité iOS',
        ...modulePedagogy('intune-ios-enrollment', 'compliance-policies'),
        sortOrder: 2,
        questions: intuneIosEnrollmentQuestions['compliance-policies'],
        game: {
          type: 'COMPLIANCE_TRIAGE',
          scenario:
            'Trois iPhone signalent des états différents : OS obsolète, PIN absent, jailbreak détecté. Ordonne les actions admin.',
          steps: [
            { id: 1, label: 'Examiner le rapport de conformité par appareil dans Intune' },
            { id: 2, label: 'Prioriser jailbreak et appliquer blocage ou retrait du parc' },
            { id: 3, label: 'Envoyer notification de mise à jour OS ou exigence PIN' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'app-protection-conditional-access',
        title: 'App Protection et Conditional Access',
        ...modulePedagogy('intune-ios-enrollment', 'app-protection-conditional-access'),
        sortOrder: 3,
        questions: intuneIosEnrollmentQuestions['app-protection-conditional-access'],
        game: {
          type: 'MAM_POLICY_ORDER',
          scenario:
            'Déployer Outlook et Teams protégés sur des iPhone BYOD. Ordonne la mise en place Intune + Entra ID.',
          steps: [
            { id: 1, label: 'Créer et assigner une politique App Protection iOS/iPadOS' },
            { id: 2, label: 'Configurer Conditional Access exigeant apps approuvées ou appareil conforme' },
            { id: 3, label: 'Valider l’accès et le conteneur de données sur un iPhone pilote' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'vpp-abm-business-apps',
        title: 'Apps métier et Apple Business Manager dans Intune',
        ...modulePedagogy('intune-ios-enrollment', 'vpp-abm-business-apps'),
        sortOrder: 4,
        questions: intuneIosEnrollmentQuestions['vpp-abm-business-apps'],
        game: {
          type: 'VPP_DEPLOY_RUNBOOK',
          scenario:
            'Déployer Microsoft Teams en Required sur 200 iPhone supervisés via VPP et Intune.',
          steps: [
            { id: 1, label: 'Valider tokens Push, ADE et VPP dans Intune et ABM' },
            { id: 2, label: 'Assigner l’app Required au groupe dynamique iOS corporate' },
            { id: 3, label: 'Contrôler App install status sur pilote puis production' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
    ],
  });

  const countQuestions = async (courseId: string) => {
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: { _count: { select: { questions: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return modules.reduce((sum, m) => sum + m._count.questions, 0);
  };

  const [appleQ, jamfQ, intuneQ] = await Promise.all([
    countQuestions(appleCourse.id),
    countQuestions(jamfCourse.id),
    countQuestions(intuneCourse.id),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_ACCOUNT.password, 12);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_ACCOUNT.email },
    update: {
      displayName: DEMO_ACCOUNT.displayName,
      passwordHash,
      provider: AuthProvider.LOCAL,
    },
    create: {
      email: DEMO_ACCOUNT.email,
      displayName: DEMO_ACCOUNT.displayName,
      passwordHash,
      provider: AuthProvider.LOCAL,
    },
  });

  await prisma.userProgress.upsert({
    where: { userId: demoUser.id },
    update: { points: 120, level: 'TECHNICIAN' },
    create: { userId: demoUser.id, points: 120, level: 'TECHNICIAN' },
  });

  const appleModules = await prisma.module.findMany({
    where: { courseId: appleCourse.id },
    select: { id: true },
  });

  for (const moduleRow of appleModules) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId: demoUser.id, moduleId: moduleRow.id } },
      update: {
        quizScore: 100,
        gameScore: 100,
        completedAt: new Date(),
      },
      create: {
        userId: demoUser.id,
        moduleId: moduleRow.id,
        quizScore: 100,
        gameScore: 100,
        completedAt: new Date(),
      },
    });
  }

  console.log(
    '✅ Seed OK — parcours:',
    appleCourse.slug,
    `(${appleQ} questions)`,
    jamfCourse.slug,
    `(${jamfQ} questions)`,
    intuneCourse.slug,
    `(${intuneQ} questions)`,
    '| compte démo:',
    DEMO_ACCOUNT.email
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
