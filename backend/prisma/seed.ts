import { CourseTrack, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedQuestion = {
  type: string;
  prompt: string;
  options: { id: string; label: string }[];
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
    steps: { id: number; label: string }[];
    solution: { correctOrder: number[] };
  };
};

async function upsertCourse(input: {
  track: CourseTrack;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  modules: SeedModule[];
}) {
  const course = await prisma.course.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      description: input.description,
      sortOrder: input.sortOrder,
    },
    create: {
      track: input.track,
      slug: input.slug,
      title: input.title,
      description: input.description,
      sortOrder: input.sortOrder,
    },
  });

  for (const item of input.modules) {
    const module = await prisma.module.upsert({
      where: { courseId_slug: { courseId: course.id, slug: item.slug } },
      update: {
        title: item.title,
        summary: item.summary,
        sortOrder: item.sortOrder,
      },
      create: {
        courseId: course.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        sortOrder: item.sortOrder,
      },
    });

    await prisma.question.deleteMany({ where: { moduleId: module.id } });
    await prisma.question.createMany({
      data: item.questions.map((question) => ({
        moduleId: module.id,
        ...question,
      })),
    });

    await prisma.game.upsert({
      where: { moduleId: module.id },
      update: item.game,
      create: { moduleId: module.id, ...item.game },
    });
  }

  return course;
}

async function main() {
  const apple = await upsertCourse({
    track: CourseTrack.APPLE,
    slug: 'apple-cert-prep',
    title: 'Parcours Apple - Device Support & MDM',
    description:
      'Révisions inspirées des objectifs Apple Device Support, Deployment & Security. Contenus originaux, non affiliés à Apple Inc.',
    sortOrder: 1,
    modules: [
      {
        slug: 'device-support-basics',
        title: 'Fondamentaux Device Support',
        summary:
          'Diagnostic matériel/logiciel, sauvegarde et réinitialisation sécurisée - résumé pédagogique original.',
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

  const jamf = await upsertCourse({
    track: CourseTrack.JAMF,
    slug: 'jamf-pro-foundations',
    title: 'Parcours Jamf Pro - Fondamentaux MDM',
    description:
      'Parcours original pour comprendre Jamf Pro, Apple Business Manager, enrôlement automatisé, politiques et supervision.',
    sortOrder: 2,
    modules: [
      {
        slug: 'abm-prestage-enrollment',
        title: 'ABM et enrôlement automatisé',
        summary:
          'Relier Apple Business Manager à Jamf Pro, préparer un PreStage et vérifier la supervision des appareils.',
        sortOrder: 1,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quel élément relie un Mac acheté par l’entreprise à un serveur MDM Jamf Pro ?',
            options: [
              { id: 'a', label: 'Un profil Wi-Fi local créé manuellement' },
              { id: 'b', label: 'Une affectation de serveur MDM dans Apple Business Manager' },
              { id: 'c', label: 'Une extension Safari installée par l’utilisateur' },
            ],
            correctOption: 'b',
            explanation:
              'ABM permet d’affecter les appareils au serveur MDM afin que Jamf applique le PreStage à l’activation.',
          },
          {
            type: 'TRUE_FALSE',
            prompt: 'Un PreStage peut imposer des étapes de configuration et associer un appareil à un site.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Le PreStage prépare l’expérience d’enrôlement et les paramètres Jamf appliqués dès le premier démarrage.',
          },
        ],
        game: {
          type: 'SCENARIO_ORDER',
          scenario:
            'Un technicien doit préparer 20 Mac neufs pour une équipe support avec enrôlement automatique Jamf.',
          steps: [
            { id: 1, label: 'Affecter les appareils au serveur MDM dans ABM' },
            { id: 2, label: 'Créer ou vérifier le PreStage Jamf Pro' },
            { id: 3, label: 'Démarrer un Mac et vérifier supervision + inventaire' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
      {
        slug: 'policies-smart-groups',
        title: 'Politiques et Smart Groups',
        summary:
          'Construire un ciblage fiable avec groupes intelligents, politiques, déclencheurs et inventaire.',
        sortOrder: 2,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Pourquoi utiliser un Smart Group avant de déployer une politique Jamf ?',
            options: [
              { id: 'a', label: 'Pour cibler dynamiquement les appareils selon des critères d’inventaire' },
              { id: 'b', label: 'Pour remplacer la signature du paquet applicatif' },
              { id: 'c', label: 'Pour désactiver toutes les restrictions de sécurité macOS' },
            ],
            correctOption: 'a',
            explanation:
              'Un Smart Group limite le déploiement aux appareils qui correspondent aux critères définis.',
          },
          {
            type: 'TRUE_FALSE',
            prompt: 'Une politique Jamf doit toujours être testée sur un petit périmètre avant généralisation.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Un pilote réduit le risque d’impact utilisateur avant un déploiement large.',
          },
        ],
        game: {
          type: 'SCENARIO_FIX',
          scenario:
            'Une mise à jour critique doit cibler uniquement les Mac portables sous une version macOS vulnérable.',
          steps: [
            { id: 1, label: 'Créer un Smart Group avec modèle portable et version macOS ciblée' },
            { id: 2, label: 'Associer la politique au Smart Group' },
            { id: 3, label: 'Suivre les logs et exclure les machines corrigées' },
          ],
          solution: { correctOrder: [1, 2, 3] },
        },
      },
    ],
  });

  console.log('Seed OK - parcours:', [apple.slug, jamf.slug].join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
