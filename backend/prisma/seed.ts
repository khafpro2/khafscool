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
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Un client signale des lenteurs sur un Mac. Quelle vérification est la plus pertinente en premier ?',
            options: [
              { id: 'a', label: 'Espace disque disponible et activité en arrière-plan' },
              { id: 'b', label: 'Remplacement immédiat du SSD' },
              { id: 'c', label: 'Réinstallation complète sans diagnostic' },
            ],
            correctOption: 'a',
            explanation:
              'Les performances dégradées proviennent souvent d’un disque saturé ou d’applications gourmandes.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Activation Lock peut empêcher la réutilisation d’un appareil Apple sans les identifiants du propriétaire.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Find My et Activation Lock protègent l’appareil ; le retrait doit suivre une procédure documentée.',
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
      {
        slug: 'ios-troubleshooting',
        title: 'Dépannage iOS et iPadOS',
        summary:
          'Diagnostiquer connectivité, batterie et blocages courants sur iPhone/iPad — méthode structurée pour techniciens.',
        sortOrder: 2,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Un iPhone ne se connecte plus au Wi-Fi d’entreprise. Quelle étape privilégier en premier ?',
            options: [
              { id: 'a', label: 'Oublier le réseau puis se reconnecter avec les bons identifiants' },
              { id: 'b', label: 'Restaurer l’appareil immédiatement' },
              { id: 'c', label: 'Désactiver le chiffrement du disque' },
            ],
            correctOption: 'a',
            explanation:
              'Réinitialiser l’association Wi-Fi élimine souvent un profil ou mot de passe obsolète avant toute restauration.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Un redémarrage forcé (combinaison boutons) peut résoudre un écran figé sans effacer les données.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Le redémarrage forcé interrompt les processus bloqués tout en préservant le contenu utilisateur.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quel outil Apple permet de consulter les journaux système d’un iPhone connecté à un Mac ?',
            options: [
              { id: 'a', label: 'Console (macOS) ou Apple Configurator pour l’inventaire' },
              { id: 'b', label: 'Time Machine uniquement' },
              { id: 'c', label: 'Boot Camp Assistant' },
            ],
            correctOption: 'a',
            explanation:
              'Console et Configurator aident à analyser les logs et l’état matériel lors d’un diagnostic avancé.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Une batterie iPhone affiche « Service » dans Réglages. Quelle action est la plus appropriée ?',
            options: [
              { id: 'a', label: 'Proposer un diagnostic batterie et une réparation si la capacité est dégradée' },
              { id: 'b', label: 'Ignorer l’alerte si l’appareil s’allume encore' },
              { id: 'c', label: 'Réinitialiser les réglages réseau uniquement' },
            ],
            correctOption: 'a',
            explanation:
              'L’état « Service » indique une dégradation significative ; un remplacement officiel évite pannes et gonflement.',
          },
        ],
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
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Avant de remettre un Mac réparé au client, quelle vérification est essentielle ?',
            options: [
              { id: 'a', label: 'Tests fonctionnels, mises à jour et effacement des données temporaires' },
              { id: 'b', label: 'Laisser le compte technicien administrateur actif' },
              { id: 'c', label: 'Désactiver FileVault pour accélérer le démarrage' },
            ],
            correctOption: 'a',
            explanation:
              'La remise en service inclut validation complète, OS à jour et respect de la confidentialité client.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Apple Diagnostics (ou Apple Hardware Test) aide à isoler une panne matérielle avant ouverture.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Les tests intégrés orientent le diagnostic vers composant défaillant (RAM, stockage, capteurs).',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle sauvegarde permet de restaurer un iPhone sur un appareil neuf avec apps et réglages ?',
            options: [
              { id: 'a', label: 'Sauvegarde iCloud ou locale chiffrée via Finder/iTunes' },
              { id: 'b', label: 'Export manuel des contacts uniquement' },
              { id: 'c', label: 'Capture d’écran des réglages' },
            ],
            correctOption: 'a',
            explanation:
              'Une sauvegarde complète chiffrée restaure données, santé et paires de clés nécessaires au fonctionnement.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Lors d’un examen Device Support, connaître l’ordre logique de diagnostic compte autant que la procédure exacte.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Apple valorise une démarche structurée : collecte des faits, tests non destructifs, puis actions correctives.',
          },
        ],
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
          {
            type: 'MULTIPLE_CHOICE',
            prompt:
              'Où crées-tu le profil d’enrôlement automatisé pour iOS dans l’administration Intune ?',
            options: [
              { id: 'a', label: 'Appareils > iOS/iPadOS > Profils d’inscription > Profils d’inscription des appareils' },
              { id: 'b', label: 'Applications > VStore uniquement' },
              { id: 'c', label: 'Rapports > Audit des connexions' },
            ],
            correctOption: 'a',
            explanation:
              'Les profils d’inscription ADE se configurent dans la section enrôlement iOS/iPadOS d’Intune.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Les appareils Apple assignés à Intune dans Apple Business Manager s’enrôlent automatiquement à la première activation.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'L’ADE garantit rattachement MDM et supervision sans configuration manuelle sur chaque appareil.',
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
      {
        slug: 'compliance-policies',
        title: 'Politiques de conformité iOS',
        summary:
          'Définir et assigner des politiques de conformité Intune pour iPhone/iPad : OS, PIN, jailbreak et actions correctives.',
        sortOrder: 2,
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'À quoi sert une politique de conformité Intune pour iOS ?',
            options: [
              { id: 'a', label: 'Vérifier que l’appareil respecte des exigences avant l’accès aux ressources' },
              { id: 'b', label: 'Remplacer Apple Business Manager' },
              { id: 'c', label: 'Installer des apps depuis l’App Store personnel' },
            ],
            correctOption: 'a',
            explanation:
              'La conformité évalue version OS, code PIN, état de l’appareil et déclenche des actions si non conforme.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Un appareil non conforme peut être bloqué de l’accès e-mail ou Teams via Conditional Access.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Intune signale l’état de conformité à Entra ID, qui peut refuser l’accès aux apps protégées.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle règle détecte typiquement un iPhone jailbreaké dans Intune ?',
            options: [
              { id: 'a', label: 'Règle « Compromission de l’appareil » (jailbreak/rooted)' },
              { id: 'b', label: 'Règle « Espace disque faible » uniquement' },
              { id: 'c', label: 'Règle « Wi-Fi désactivé »' },
            ],
            correctOption: 'a',
            explanation:
              'La détection de compromission bloque les appareils modifiés, fréquemment interdits en entreprise.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle action Intune appliquer si un iPad ne respecte pas la version iOS minimale ?',
            options: [
              { id: 'a', label: 'Marquer non conforme et notifier l’utilisateur de mettre à jour' },
              { id: 'b', label: 'Supprimer le compte utilisateur du tenant' },
              { id: 'c', label: 'Désinscrire tous les appareils du parc' },
            ],
            correctOption: 'a',
            explanation:
              'La non-conformité déclenche alertes et restrictions ciblées plutôt qu’une action destructive globale.',
          },
        ],
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
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quelle différence clé entre MAM et MDM complet sur iOS ?',
            options: [
              { id: 'a', label: 'MAM protège les données des apps sans enrôler entièrement l’appareil' },
              { id: 'b', label: 'MAM remplace le certificat Push Apple' },
              { id: 'c', label: 'MAM ne fonctionne que sur Android' },
            ],
            correctOption: 'a',
            explanation:
              'App Protection (MAM) sécurise Outlook, Teams, etc. sur appareils personnels ou gérés sans contrôle total.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Conditional Access peut exiger un appareil géré ou conforme avant d’autoriser l’accès à Exchange Online.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Les stratégies CA combinent état Intune, localisation et risque utilisateur pour autoriser ou bloquer.',
          },
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Quel paramètre App Protection empêche la copie de données corporate vers apps personnelles ?',
            options: [
              { id: 'a', label: 'Transfert de données restreint (Restrict cut/copy/paste)' },
              { id: 'b', label: 'Désactivation du mode avion' },
              { id: 'c', label: 'Rotation automatique de l’écran' },
            ],
            correctOption: 'a',
            explanation:
              'La restriction de transfert isole les données d’entreprise dans le conteneur géré des apps M365.',
          },
          {
            type: 'TRUE_FALSE',
            prompt:
              'Une politique App Protection peut exiger un PIN ou biométrie avant d’ouvrir Outlook sur iOS.',
            options: [
              { id: 'true', label: 'Vrai' },
              { id: 'false', label: 'Faux' },
            ],
            correctOption: 'true',
            explanation:
              'Le verrouillage au niveau application renforce la sécurité même sur appareils non supervisés.',
          },
        ],
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
