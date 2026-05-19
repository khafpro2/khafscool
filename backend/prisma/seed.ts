import { CourseTrack, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedQuestion = {
  type: string;
  prompt: string;
  options: Prisma.InputJsonValue;
  correctOption: string;
  explanation: string;
};

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
      ...question,
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

async function main() {
  const appleCourse = await seedCourse({
    track: CourseTrack.APPLE,
    slug: 'apple-cert-prep',
    title: 'Parcours Apple — Device Support & MDM',
    description:
      'Révisions inspirées des objectifs Apple Device Support, Deployment & Security. Contenus originaux, non affiliés à Apple Inc.',
    sortOrder: 1,
    modules: [
      {
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary:
          'Diagnostic matériel/logiciel, sauvegarde et réinitialisation sécurisée — résumé pédagogique original.',
        sortOrder: 1,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: "Un iPhone ne s'allume plus après une chute. Quelle est la première étape logique ?",
            options: [
              { id: 'a', label: 'Remplacer la batterie immédiatement' },
              { id: 'b', label: 'Vérifier chargeur/câble et forcer le redémarrage' },
              { id: 'c', label: 'Restaurer sans sauvegarde' },
            ],
            correctOption: 'b',
            explanation:
              'On élimine d’abord alimentation et redémarrage forcé avant toute réparation matérielle.',
          },
          {
            type: 'TRUE_FALSE',
            prompt: 'Avant une restauration, il est recommandé de vérifier les sauvegardes disponibles.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation: 'Aligné sur les bonnes pratiques de support Apple.',
          },
        ],
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
    ],
  });

  const jamfCourse = await seedCourse({
    track: CourseTrack.JAMF,
    slug: 'jamf-pro-foundations',
    title: 'Fondamentaux Jamf Pro',
    description:
      'Maîtrise inventaire, smart groups, politiques et bonnes pratiques MDM pour administrer une flotte Apple avec Jamf Pro.',
    sortOrder: 2,
    modules: [
      {
        slug: 'smart-groups-policies',
        title: 'Smart Groups et politiques',
        summary:
          'Comprendre comment cibler des Mac et déclencher une politique Jamf Pro sur un périmètre pilote.',
        sortOrder: 1,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'À quoi sert principalement un Smart Group Jamf Pro ?',
            options: [
              { id: 'a', label: 'Créer un compte Apple Business Manager' },
              { id: 'b', label: 'Cibler dynamiquement des appareils selon des critères' },
              { id: 'c', label: 'Remplacer le serveur MDM' },
            ],
            correctOption: 'b',
            explanation:
              'Un Smart Group regroupe automatiquement les appareils correspondant à des critères d’inventaire ou de conformité.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Une politique de configuration peut être limitée à un Smart Group sans toucher au reste de la flotte.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Le scope par Smart Group permet de tester et déployer progressivement sur Jamf Pro.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Quel élément relie typiquement un paquet logiciel à des Mac ciblés dans Jamf Pro ?',
            options: [
              { id: 'a', label: 'Une politique (policy) associée au scope du Smart Group' },
              { id: 'b', label: 'Un profil Wi-Fi iOS uniquement' },
              { id: 'c', label: 'Une sauvegarde Time Machine centralisée' },
            ],
            correctOption: 'a',
            explanation:
              'Les politiques appliquent paquets, scripts ou profils aux appareils du périmètre choisi.',
          },
        ],
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
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Où consultes-tu en priorité l’état d’un Mac dans Jamf Pro ?',
            options: [
              { id: 'a', label: 'Fiche inventaire de l’ordinateur' },
              { id: 'b', label: 'Console Apple Business Manager uniquement' },
              { id: 'c', label: 'Journal système local du Mac' },
            ],
            correctOption: 'a',
            explanation:
              'La fiche inventaire centralise hardware, OS, extensions et statut de gestion MDM.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Un appareil « non conforme » peut indiquer qu’une politique ou un critère de sécurité n’est pas respecté.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'La conformité Jamf aide à repérer les écarts avant qu’ils deviennent des incidents.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle action est la plus adaptée pour un Mac hors conformité sur une version macOS obsolète ?',
            options: [
              { id: 'a', label: 'Planifier une politique de mise à jour ciblée' },
              { id: 'b', label: 'Supprimer immédiatement le compte utilisateur' },
              { id: 'c', label: 'Désactiver le MDM sur tout le parc' },
            ],
            correctOption: 'a',
            explanation:
              'Une politique de mise à jour ou un Smart Group dédié permet de remettre le parc à niveau progressivement.',
          },
        ],
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
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Quel prérequis permet à Jamf Pro de recevoir les appareils assignés depuis Apple Business Manager ?',
            options: [
              { id: 'a', label: 'Un jeton serveur MDM Apple valide' },
              { id: 'b', label: 'Un compte iCloud personnel partagé' },
              { id: 'c', label: 'Un profil Wi-Fi installé manuellement sur chaque Mac' },
            ],
            correctOption: 'a',
            explanation:
              'Le jeton serveur MDM synchronise les appareils ABM avec Jamf Pro pour l’enrôlement automatisé.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'L’APNs (Apple Push Notification service) est nécessaire pour que Jamf communique avec les appareils gérés.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Sans certificat Push valide, les commandes MDM ne peuvent pas atteindre les appareils.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quel profil ADE contrôle typiquement l’expérience Setup Assistant à la première activation ?',
            options: [
              { id: 'a', label: 'Profil Automated Device Enrollment dans Jamf Pro' },
              { id: 'b', label: 'Profil de messagerie Exchange uniquement' },
              { id: 'c', label: 'Profil de fond d’écran partagé' },
            ],
            correctOption: 'a',
            explanation:
              'Le profil ADE définit supervision, étapes masquées et rattachement MDM dès l’activation.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Un Mac supervisé via Jamf peut recevoir des restrictions et déploiements impossibles sur un appareil non supervisé.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'La supervision Apple débloque des capacités MDM avancées côté Jamf Pro.',
          },
        ],
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
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    description:
      'Parcours pratique pour préparer l’enrôlement Apple Business Manager, les profils de conformité et les stratégies de sécurité dans Intune.',
    sortOrder: 3,
    modules: [
      {
        slug: 'ade-enrollment-basics',
        title: 'Préparer Automated Device Enrollment',
        summary:
          'Associer Apple Business Manager à Intune, affecter un profil ADE et valider l’expérience Setup Assistant.',
        sortOrder: 1,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Quel prérequis relie Apple Business Manager à Intune pour synchroniser les appareils supervisés ?',
            options: [
              { id: 'a', label: 'Un jeton serveur MDM Apple valide' },
              { id: 'b', label: 'Un profil Wi-Fi installé manuellement' },
              { id: 'c', label: 'Une sauvegarde iCloud partagée' },
            ],
            correctOption: 'a',
            explanation:
              'Le jeton serveur MDM permet à Intune de récupérer les appareils assignés depuis Apple Business Manager.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Un profil ADE peut imposer la supervision et masquer certaines étapes de Setup Assistant.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Les profils ADE contrôlent l’expérience initiale et les paramètres de supervision des appareils Apple.',
          },
        ],
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
    ],
  });

  console.log(
    '✅ Seed OK — parcours:',
    appleCourse.slug,
    jamfCourse.slug,
    intuneCourse.slug
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
