import { CourseTrack, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: 'apple-cert-prep' },
    update: {
      title: 'Parcours Apple — Device Support & MDM',
      description:
        'Révisions inspirées des objectifs Apple Device Support, Deployment & Security. Contenus originaux, non affiliés à Apple Inc.',
    },
    create: {
      track: CourseTrack.APPLE,
      slug: 'apple-cert-prep',
      title: 'Parcours Apple — Device Support & MDM',
      description:
        'Révisions inspirées des objectifs Apple Device Support, Deployment & Security. Contenus originaux, non affiliés à Apple Inc.',
      sortOrder: 1,
      modules: {
        create: [
          {
            slug: 'device-support-basics',
            title: 'Fondamentaux Device Support',
            summary:
              'Diagnostic matériel/logiciel, sauvegarde et réinitialisation sécurisée — résumé pédagogique original.',
            sortOrder: 1,
            questions: {
              create: [
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt:
                    "Un iPhone ne s'allume plus après une chute. Quelle est la première étape logique ?",
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
            },
            game: {
              create: {
                type: 'SCENARIO_FIX',
                scenario:
                  'Un MacBook affiche une roue de chargement au démarrage après une mise à jour macOS.',
                steps: [
                  { id: 1, label: 'Démarrer en mode sans échec' },
                  { id: 2, label: 'Vérifier l’espace disque disponible' },
                  { id: 3, label: 'Réinstaller macOS en conservant les données' },
                ],
                solution: { correctOrder: [2, 1, 3] },
              },
            },
          },
        ],
      },
    },
  });

  console.log('✅ Seed OK — parcours Apple:', course.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
