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

  const serviceNowCourse = await seedCourse({
    track: CourseTrack.SERVICENOW,
    slug: 'servicenow-ticket-triage',
    title: 'ServiceNow — Triage support Apple',
    description:
      'Mise en situation help desk pour prioriser, qualifier et documenter les incidents Apple dans ServiceNow.',
    sortOrder: 4,
    modules: [
      {
        slug: 'incident-priority-basics',
        title: 'Prioriser un incident Apple',
        summary:
          'Identifier impact, urgence, catégorie et note de résolution avant escalade vers MDM ou support matériel.',
        sortOrder: 1,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Un parc de 80 iPad partagés ne reçoit plus les profils Wi-Fi avant une session de formation. Quelle priorité est la plus cohérente ?',
            options: [
              { id: 'a', label: 'P1 critique : arrêt complet de toute l’entreprise' },
              { id: 'b', label: 'P2 élevée : impact large avec contournement limité' },
              { id: 'c', label: 'P4 basse : demande cosmétique sans urgence' },
            ],
            correctOption: 'b',
            explanation:
              'L’impact est large et bloque une activité planifiée, mais ne correspond pas forcément à une panne globale entreprise.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Une bonne note de résolution doit inclure le symptôme, la cause probable et l’action réalisée.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Ces éléments facilitent la recherche ultérieure, la passation et l’analyse des tendances.',
          },
        ],
        game: {
          type: 'TICKET_TRIAGE',
          scenario:
            'Trois tickets arrivent pendant le déploiement iOS. Classe-les pour traiter le risque opérationnel le plus fort en premier.',
          steps: [
            { id: 1, label: 'Un utilisateur demande un nouveau fond d’écran géré' },
            { id: 2, label: 'Les iPhone de direction ne reçoivent plus les profils VPN' },
            { id: 3, label: 'Un Mac isolé a besoin d’une mise à jour mineure hors délai' },
          ],
          solution: { correctOrder: [2, 3, 1] },
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

  console.log('✅ Seed OK — parcours:', appleCourse.slug, intuneCourse.slug, serviceNowCourse.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
