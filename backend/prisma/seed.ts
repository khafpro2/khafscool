import { CourseTrack, Prisma, PrismaClient } from '@prisma/client';
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
      sortOrder: module.sortOrder,
    },
    create: {
      courseId,
      slug: module.slug,
      title: module.title,
      summary: module.summary,
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

async function main() {
  const appleCourse = await seedCourse({
    track: CourseTrack.APPLE,
    slug: 'apple-cert-prep',
    title: pathTitle('apple-cert-prep'),
    description:
      'Parcours fondamental pour techniciens support et débutants MDM sur l’écosystème Apple. En fin de parcours, tu sauras diagnostiquer Mac, iPhone et iPad, sécuriser sauvegardes et restaurations, structurer ta préparation à l’examen Apple Device Support et relier support terrain et bases MDM. Contenus originaux, non affiliés à Apple Inc.',
    sortOrder: 1,
    modules: [
      {
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary:
          'Diagnostic matériel/logiciel, sauvegarde et réinitialisation sécurisée — résumé pédagogique original.',
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
        summary:
          'Diagnostiquer connectivité, batterie et blocages courants sur iPhone/iPad — méthode structurée pour techniciens.',
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
        summary:
          'Réviser les domaines clés Apple Device Support : sécurité, sauvegarde, restauration et bonnes pratiques atelier.',
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
    ],
  });

  const jamfCourse = await seedCourse({
    track: CourseTrack.JAMF,
    slug: 'jamf-pro-foundations',
    title: pathTitle('jamf-pro-foundations'),
    description:
      'Parcours pratique pour administrateurs MDM Jamf. En fin de parcours, tu sauras cibler des appareils avec smart groups, déployer des politiques pilotes, lire l’inventaire et la conformité Jamf, et enrôler une flotte supervisée via Apple Business Manager.',
    sortOrder: 2,
    modules: [
      {
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        summary:
          'Comprendre comment cibler des Mac et déclencher une politique Jamf Pro sur un périmètre pilote.',
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
        summary:
          'Lire l’inventaire Jamf, interpréter la conformité et prioriser les actions sur les appareils hors norme.',
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
        summary:
          'Relier Apple Business Manager, certificats Push et expérience d’enrôlement automatisé pour une flotte supervisée.',
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
    ],
  });

  const intuneCourse = await seedCourse({
    track: CourseTrack.INTUNE,
    slug: 'intune-ios-enrollment',
    title: pathTitle('intune-ios-enrollment'),
    description:
      'Parcours pour admins Microsoft 365 et équipes endpoint hybrides. En fin de parcours, tu sauras configurer l’enrôlement automatisé (ADE) pour iOS/iPadOS, déployer des politiques de conformité Intune et protéger les apps M365 avec App Protection et Conditional Access.',
    sortOrder: 3,
    modules: [
      {
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        summary:
          'Associer Apple Business Manager à Intune, affecter un profil ADE et valider l’expérience Setup Assistant.',
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
        summary:
          'Définir et assigner des politiques de conformité Intune pour iPhone/iPad : OS, PIN, jailbreak et actions correctives.',
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
        summary:
          'Protéger les données M365 sur iOS avec des politiques App Protection (MAM) et Conditional Access pour les apps gérées.',
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

  console.log(
    '✅ Seed OK — parcours:',
    appleCourse.slug,
    `(${appleQ} questions)`,
    jamfCourse.slug,
    `(${jamfQ} questions)`,
    intuneCourse.slug,
    `(${intuneQ} questions)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
