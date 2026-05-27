import type { CourseSlug } from './learning-paths.js';

export type QuizOption = { id: string; label: string };

export type SeedQuestion = {
  type: string;
  prompt: string;
  options: QuizOption[];
  correctOption: string;
  explanation: string;
  /** Réservé à l'examen blanc — exclu du quiz module (10 Q affichées). */
  examOnly?: boolean;
};

/** Questions module visibles dans le parcours (hors bonus exam-only). */
export function moduleQuizQuestions<T extends { examOnly?: boolean }>(questions: T[]): T[] {
  return questions.filter((question) => !question.examOnly);
}

export function toDemoQuestions(
  moduleKey: string,
  questions: SeedQuestion[]
): Array<SeedQuestion & { id: string }> {
  return questions.map((question, index) => ({
    ...question,
    id: `demo-${moduleKey}-q${index + 1}`,
  }));
}

const opt = (a: string, b: string, c: string, d: string) => [
  { id: 'a', label: a },
  { id: 'b', label: b },
  { id: 'c', label: c },
  { id: 'd', label: d },
];

export const appleCertPrepQuestions: Record<string, SeedQuestion[]> = {
  'device-support-basics': [
    {
      type: 'SCENARIO',
      prompt:
        "Un iPhone 14 ne s'allume plus après une chute. L'écran reste noir, aucune vibration au branchement. Quelle est la première étape conforme aux bonnes pratiques Device Support ?",
      options: opt(
        "Remplacer immédiatement la batterie en atelier sans diagnostic préalable",
        "Vérifier câble/chargeur certifié, laisser charger 15 min",
        "Restaurer en DFU sans demander de sauvegarde sans diagnostic préalable",
        "Désactiver Find My depuis le Mac du technicien sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'On élimine d’abord alimentation et redémarrage forcé (non destructif) avant toute ouverture ou restauration. Le DFU efface les données et n’est pertinent qu’après échec des étapes simples.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Avant toute restauration iOS sur un appareil client, quelle vérification est la plus critique pour la continuité des données ?',
      options: opt(
        "Confirmer l’existence d’une sauvegarde iCloud ou locale récente",
        "Désinstaller toutes les apps tierces sans diagnostic préalable",
        "Réinitialiser uniquement les réglages réseau sans diagnostic préalable",
        "Activer le mode développeur sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Une sauvegarde complète chiffrée permet de restaurer apps, santé et paires de clés. Sans elle, la restauration est irréversible pour les données utilisateur.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un MacBook Air M2 est très lent : fan audible, apps qui rament. Espace disque : 4 Go libres sur 256 Go. Quelle action prioriser ?',
      options: opt(
        "Remplacer le SSD sous garantie — piste peu adaptée au scénario",
        "Libérer de l’espace disque",
        "Réinstaller macOS sans sauvegarde sans diagnostic préalable",
        "Désactiver FileVault pour « accélérer » le Mac sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Un disque quasi plein provoque swap excessif et ralentissements. Libérer de l’espace et analyser l’activité sont des étapes de premier niveau avant réparation matérielle.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Activation Lock est activé sur un iPhone repris en SAV. Que doit faire le technicien avant toute réinitialisation ?',
      options: opt(
        "Vérifier la procédure de retrait Activation Lock avec le propriétaire ou l’organis…",
        "Contourner le verrouillage via un outil tiers sans diagnostic préalable",
        "Remplacer la carte mère sans documentation — piste peu adaptée au scénario",
        "Effacer l’appareil depuis Réglages sans authentification sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Find My / Activation Lock protège l’appareil. Le retrait légitime passe par le compte propriétaire, le portail ABM ou le MDM — jamais par contournement non documenté.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un collègue propose un « redémarrage forcé » alors que l’iPhone affiche l’écran de récupération iTunes/Finder avec une erreur 4013. Quelle réponse est la plus juste ?',
      options: opt(
        "Le redémarrage forcé suffit toujours avant toute restauration sans diagnostic préalable",
        "L’erreur 4013 indique souvent un problème USB/câble ou port, vérifier câble certifié",
        "Il faut immédiatement changer la batterie (option incorrecte pour ce cas)",
        "4013 signifie que Find My est désactivé — aucune action requise sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Les codes 401x/9xx lors d’une restauration pointent fréquemment vers connectique ou port USB instable. Le redémarrage forcé ne résout pas un échec de restauration matérielle/logicielle en cours.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un technicien terrain doit documenter une intervention iPhone pour le SAV Apple. Quel élément doit figurer en priorité dans le ticket ?',
      options: opt(
        "Numéro de série, version iOS, symptômes, étapes déjà tentées",
        "Uniquement la couleur de l’appareil — piste peu adaptée au scénario",
        "Le mot de passe iCloud du client en clair sans diagnostic préalable",
        "La liste des apps TikTok installées — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'La traçabilité SAV repose sur l’identification précise de l’appareil, le contexte logiciel et les actions déjà réalisées — sans stocker de secrets d’authentification.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Un Mac d’entreprise supervisé affiche un profil MDM « non vérifié » dans Réglages. Quelle action est la plus appropriée pour un technicien support ?',
      options: opt(
        "Contacter l’équipe MDM pour vérifier certificat SCEP/PKI",
        "Supprimer manuellement le profil MDM depuis Réglages Système sans diagnostic préalable",
        "Désactiver SIP pour forcer la confiance du certificat sans diagnostic préalable",
        "Réinstaller macOS sans consulter la console MDM sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Un profil MDM non vérifié indique souvent un certificat d’identité expiré ou une chaîne PKI/SCEP mal renouvelée. Le technicien support documente le symptôme et escalade vers l’admin MDM qui renouvelle le profil ou le certificat via la console. Supprimer le profil manuellement est impossible ou déconseillé sur un appareil supervisé. Une réinstallation sans diagnostic MDM risque de reproduire le même échec au prochain enrôlement.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Lors d’un inventaire terrain, vous devez confirmer si un iPad scolaire provient d’Apple Business Manager et est assigné au bon serveur MDM. Où vérifier en priorité ?',
      options: opt(
        "Console MDM (inventaire appareil)",
        "App Réglages > Safari > Historique — piste peu adaptée au scénario",
        "Compte iCloud personnel de l’élève uniquement sans diagnostic préalable",
        "App Store > Achats de l’utilisateur — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Apple Business Manager indique si l’appareil est assigné au serveur MDM de l’établissement. La console MDM confirme l’enrôlement, la supervision et la dernière check-in. Ces deux sources croisées évitent les erreurs d’assignation lors des déploiements ADE. L’historique Safari ou le compte iCloud personnel ne renseignent pas sur l’origine ABM ni sur l’assignation MDM.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle capacité la supervision Apple débloque-t-elle pour un iPhone d’entreprise géré par MDM ?',
      options: opt(
        "Profils MDM non supprimables par l’utilisateur",
        "Désactivation automatique d’Activation Lock sans ABM sans diagnostic préalable",
        "Installation d’apps Android via sideload — piste peu adaptée au scénario",
        "Suppression du chiffrement hardware Secure Enclave sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'La supervision est établie via ADE ou Apple Configurator et élargit le périmètre MDM : l’utilisateur ne peut pas retirer le profil de gestion sur un appareil supervisé avec enrôlement verrouillé. Les payloads restrictions, filtrage web et mode single-app deviennent disponibles. Activation Lock reste actif et se gère via ABM ou MDM — la supervision ne le désactive pas. Distinction essentielle en support L1 face à un iPhone personnel où l’utilisateur peut refuser ou supprimer le profil MDM non supervisé.',
    },
    {
      type: 'SCENARIO',
      prompt:
        '200 iPhones supervisés : les apps VPP déployées par MDM restent « En attente » alors que Safari fonctionne. Première piste réseau ?',
      options: opt(
        "Filtrage proxy/pare-feu bloquant les domaines CDN Apple (gsp.apple.c…",
        "FileVault désactivé sur les iPhone sans diagnostic préalable",
        "Expiration du certificat BitLocker sans diagnostic préalable",
        "Absence de compte Google Workspace sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les apps VPP installées via MDM téléchargent binaires depuis l’infrastructure Apple CDN. Un proxy d’entreprise peut autoriser la navigation web tout en bloquant ces domaines. Vérifiez logs proxy, DNS interne et restrictions de contenu iOS. Côté MDM, contrôlez statut InstallApplication et licences VPP assignées. Ce pattern est fréquent après durcissement réseau sans liste blanche Apple mise à jour. Ne restaurez pas en masse avant d’isoler la cause réseau ou certificat.',
    },
  ],
  'ios-troubleshooting': [
    {
      type: 'SCENARIO',
      prompt:
        'Un iPhone d’entreprise ne joint plus le Wi-Fi 802.1X après changement de mot de passe AD. Que tester en premier sur l’appareil ?',
      options: opt(
        "Oublier le réseau, resaisir les identifiants 802.1X",
        "Restaurer l’iPhone immédiatement sans diagnostic préalable",
        "Désactiver le chiffrement du disque sans diagnostic préalable",
        "Supprimer le profil MDM manuellement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les profils Wi-Fi d’entreprise conservent souvent d’anciens identifiants. Oublier le réseau et resynchroniser l’heure règlent la majorité des échecs 802.1X sans effacer l’appareil.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel geste permet de redémarrer un iPhone bloqué sur l’écran Apple sans effacer les données utilisateur ?',
      options: opt(
        "Combinaison de redémarrage forcé adaptée au modèle (boutons volum…",
        "Restauration DFU immédiate sans diagnostic préalable",
        "Réinitialisation « Effacer contenu et réglages » sans diagnostic préalable",
        "Retrait de la carte SIM uniquement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le redémarrage forcé interrompt les processus figés tout en préservant les données. DFU et effacement sont des étapes ultérieures si le blocage persiste.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Pour analyser les logs d’un iPhone supervisé connecté à un Mac, quels outils sont les plus appropriés ?',
      options: opt(
        "Console (macOS) et/ou Apple Configurator pour l’inventaire",
        "Time Machine uniquement — piste peu adaptée au scénario",
        "Boot Camp Assistant — piste peu adaptée au scénario",
        "Utilitaire de disque pour formater l’iPhone sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Console affiche les journaux système en temps réel ; Configurator aide à l’inventaire et au dépannage MDM sur flotte supervisée.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Réglages > Batterie affiche « Service » sur un iPhone 11. Le client se plaint d’extinction soudaine à 30 %. Quelle recommandation professionnelle ?',
      options: opt(
        "Proposer diagnostic batterie officiel",
        "Ignorer l’alerte si l’appareil s’allume encore sans diagnostic préalable",
        "Réinitialiser uniquement les réglages réseau sans diagnostic préalable",
        "Installer une app « calibrage batterie » du App Store sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’état Service signale une dégradation avancée. Un remplacement par pièce d’origine ou programme Apple évite gonflement et pannes thermiques.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : après mise à jour iOS, plusieurs apps MDM restent « En attente ». Le Wi-Fi fonctionne pour Safari. Cause la plus plausible ?',
      options: opt(
        "Le MDM est désinstallé — aucune action — piste peu adaptée au scénario",
        "Restriction réseau, proxy ou pare-feu bloquant les domaines Apple/MDM",
        "La batterie est à 100 % — normal (option incorrecte pour ce cas)",
        "Il faut jailbreaker pour débloquer les apps sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Les apps en attente lors d’un déploiement MDM pointent souvent vers filtrage réseau ou cache CDN Apple. Safari fonctionnel n’exclut pas un blocage des URLs de téléchargement gérées.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un iPad scolaire n’affiche plus le profil MDM dans Réglages mais les apps gérées fonctionnent. Que vérifier côté console MDM ?',
      options: opt(
        "Dernière date de check-in, commandes en attente",
        "Uniquement la couleur de la coque sans diagnostic préalable",
        "Le compte iCloud personnel de l’élève sans diagnostic préalable",
        "La version de watchOS sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’absence visible du profil peut coexister avec une gestion partielle ; la console MDM confirme l’enrôlement, la supervision et les commandes en échec.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Un profil Wi-Fi d’entreprise 802.1X avec certificat SCEP ne s’installe plus après renouvellement PKI. Quelle piste MDM est la plus pertinente ?',
      options: opt(
        "Vérifier validité du profil SCEP, chaîne CA",
        "Réinitialiser le mot de passe Apple ID de l’utilisateur sans diagnostic préalable",
        "Désactiver le chiffrement FileVault sur le Mac admin sans diagnostic préalable",
        "Changer la langue du clavier iOS (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'SCEP (Simple Certificate Enrollment Protocol) permet de délivrer automatiquement des certificats client pour l’authentification Wi-Fi ou VPN. Si la CA ou le template SCEP a changé, les profils existants échouent jusqu’au redéploiement. L’admin MDM vérifie expiration, URL SCEP et correspondance du sujet certificat. Un renouvellement PKI bien planifié inclut une fenêtre de chevauchement et un scope pilote avant déploiement global.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Plusieurs iPhone d’une flotte supervisée perdent simultanément la connectivité MDM après changement de certificat Push. Quelle cause est la plus probable ?',
      options: opt(
        "Certificat APNs MDM expiré ou mal importé",
        "Les utilisateurs ont tous désinstallé Safari — piste peu adaptée au scénario",
        "La version iOS est identique sur tous les appareils sans diagnostic préalable",
        "Le mode basse consommation désactive uniquement le Wi-Fi personnel sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le canal MDM repose sur Apple Push Notification service : sans certificat APNs valide, les check-in et déploiements échouent en masse. Un changement de certificat mal importé (topic APNs différent) peut même nécessiter un réenrôlement. L’admin vérifie la date d’expiration dans la console MDM et le portail Apple Push Certificates. Les symptômes groupés après maintenance certificat orientent fortement vers cette cause plutôt que vers un problème utilisateur individuel.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Sur iPhone supervisé Jamf Pro, quelle information la console affiche-t-elle pour confirmer que le canal Push MDM est fonctionnel ?',
      options: opt(
        "Dernière check-in récente",
        "Couleur de la coque déclarée par l’utilisateur sans diagnostic préalable",
        "Nombre de photos iCloud — piste peu adaptée au scénario",
        "Version de watchOS associée sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Jamf Pro affiche la dernière communication MDM sur la fiche appareil mobile. Une check-in récente prouve que APNs livre les notifications au device. Si les commandes restent Pending malgré check-in, investiguez scope politique ou erreur payload. Une check-in stale (>48 h) sur appareil actif oriente vers certificat Push expiré, réseau ou appareil éteint prolongé. Le support L1 remonte ces timestamps à l’admin MDM avant toute action destructive.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Après renouvellement certificat Push APNs dans Jamf, 50 iPhone perdent le check-in simultanément. Cause la plus probable ?',
      options: opt(
        "Topic APNs différent ou import incomplet : les appareils ne reconnaissent pl…",
        "Bluetooth désactivé en masse sur les 50 iPhone concernés sans diagnostic préalable",
        "iOS 17 interdit désormais toute gestion MDM entreprise sans diagnostic préalable",
        "Mode Focus « Ne pas déranger » bloque les commandes MDM sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le certificat Push MDM authentifie le serveur Jamf auprès d’APNs avec un topic unique. Un renouvellement doit conserver le même topic ; un certificat recréé from scratch change le topic et casse la gestion existante. Symptôme typique : check-in groupée stale après maintenance. Vérifier Settings → Apple Push Certificates dans Jamf et identity.apple.com. Planifiez renouvellement 30 jours avant expiration et testez sur appareil pilote. Documentez la procédure pour éviter réenrôlement massif de 200 iPhone.',
    },
  ],
  'acmt-exam-prep': [
    {
      type: 'SCENARIO',
      prompt:
        'Avant de rendre un MacBook Pro réparé (remplacement clavier) au client entreprise, quelle checklist est conforme aux attentes Device Support ?',
      options: opt(
        "Tests clavier/trackpad, OS à jour, comptes temporaires retirés, confidentialité r…",
        "Laisser le compte admin atelier actif pour « faciliter le SAV » sans diagnostic préalable",
        "Désactiver FileVault pour accélérer les prochains démarrages sans diagnostic préalable",
        "Installer un profil MDM personnel du technicien sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'La remise en service exige validation fonctionnelle, système à jour et aucune donnée/compte résiduel du technicien — base de la confiance client et conformité.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'À quoi sert Apple Diagnostics (ou Apple Hardware Test sur modèles plus anciens) en atelier ?',
      options: opt(
        "Isoler une défaillance matérielle probable avant ouverture…",
        "Activer le mode développeur iOS sans diagnostic préalable",
        "Créer un compte Apple Business Manager sans diagnostic préalable",
        "Synchroniser les apps Jamf sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les tests intégrés renvoient des codes erreur orientant RAM, stockage, capteurs ou alimentation — gain de temps et traçabilité SAV.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel type de sauvegarde iPhone permet une restauration complète sur un appareil neuf (apps, réglages, données Santé) ?',
      options: opt(
        "Sauvegarde iCloud ou locale chiffrée via Finder/i…",
        "Export VCF des contacts seulement sans diagnostic préalable",
        "Capture d’écran des réglages Wi-Fi sans diagnostic préalable",
        "AirDrop des photos uniquement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Seule une sauvegarde complète chiffrée inclut les données Santé et les paires de clés nécessaires à une migration fidèle.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un Mac Intel ne démarre plus : pas de son de démarrage, voyant chargeur orange fixe. Ordre de diagnostic recommandé ?',
      options: opt(
        "Vérifier alimentation/câble, test batterie/SMC si applicable,",
        "Remplacer la carte mère sans test sans diagnostic préalable",
        "Réinstaller macOS en premier sans diagnostic préalable",
        "Désactiver SIP avant toute mesure sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’alimentation et les contrôleurs de charge sont vérifiés avant toute hypothèse carte mère. Apple Diagnostics affine ensuite le composant suspect.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : en préparation ACMT, on vous demande si « connaître la procédure exacte de chaque code erreur » est indispensable. Quelle affirmation est la plus exacte ?',
      options: opt(
        "Il faut mémoriser tous les codes par cœur sans documentation sans diagnostic préalable",
        "Une démarche structurée (faits, tests non destructifs, documentation) prime sur le déta…",
        "Les codes Diagnostics ne servent jamais en SAV — piste peu adaptée au scénario",
        "Seul le remplacement immédiat du SSD est accepté sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Apple valorise la méthode : collecter les symptômes, appliquer des tests sûrs, documenter — les codes guident mais ne remplacent pas le raisonnement.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle pratique respecte le cadre confidentialité / RGPD lors d’un diagnostic sur Mac client ?',
      options: opt(
        "Travailler sur copie ou compte invité, ne pas exporter de données personnelles sans…",
        "Copier le dossier Documents sur clé USB personnelle « pour analyse » sans diagnostic préalable",
        "Publier les logs sur un forum public (option incorrecte pour ce cas)",
        "Conserver le mot de passe session dans le ticket sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le technicien limite l’accès aux données nécessaires et documente les actions sans exfiltration — aligné sur les standards atelier et réglementaires.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un technicien prépare un MacBook Pro pour restitution client entreprise avec profil MDM actif. Quelle étape respecte à la fois SAV Apple et continuité MDM ?',
      options: opt(
        "Coordonner avec l’admin MDM pour retrait ou wipe géré,",
        "Effacer le disque sans informer l’équipe MDM ni documenter le numéro de série sans diagnostic préalable",
        "Laisser le compte admin atelier permanent pour « faciliter le SAV futur » sans diagnostic préalable",
        "Installer un profil de test personnel du technicien — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'En parc géré, la restitution ou le SAV doit préserver la traçabilité MDM : retrait contrôlé, wipe si nécessaire, puis tests matériels. Apple Diagnostics et validation clavier/trackpad restent requis avant remise. Laisser un compte admin atelier ou un profil personnel viole les bonnes pratiques sécurité. L’effacement non coordonné peut laisser l’appareil bloqué par Activation Lock ou hors conformité.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel lien existe entre Apple Business Manager et la préparation Device Support en entreprise ?',
      options: opt(
        "ABM centralise achats, assignation MDM, le technicien doit connaître supervision",
        "ABM remplace entièrement les outils de diagnostic matériel Apple sans diagnostic préalable",
        "ABM sert uniquement à acheter des apps sur l’App Store grand public sans diagnostic préalable",
        "ABM n’a aucun rapport avec Find My ou Activation Lock sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Apple Business Manager est le point d’entrée pour l’ADE et l’assignation au serveur MDM de l’organisation. Le technicien Device Support y trouve des réponses sur la propriété de l’appareil et les voies légitimes de retrait Activation Lock. ABM ne remplace pas Apple Diagnostics ni les procédures atelier. Comprendre ce lien évite les contournements non autorisés lors des reprises SAV ou recyclage parc.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Que se passe-t-il généralement après effacement complet d’un iPhone supervisé ADE toujours assigné dans ABM ?',
      options: opt(
        "Au redémarrage, Setup Assistant réenrôle automatiquement via Remote Management vers le…",
        "L’appareil devient non supervisé définitivement sans action admin sans diagnostic préalable",
        "Activation Lock disparaît sans compte Apple — piste peu adaptée au scénario",
        "Le MDM ne peut plus jamais gérer cet appareil — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Automated Device Enrollment lie l’appareil au serveur MDM dans ABM. Après effacement, l’assistant affiche Remote Management et réapplique supervision + profil MDM sans intervention utilisateur si locked enrollment. Le technicien Device Support doit connaître ce comportement pour ne pas paniquer face à un « re-setup » normal en SAV. Si assignation ABM retirée, l’appareil se comporte comme consumer. Distinction clé examen : restauration locale vs fin de vie appareil avec retrait ABM.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un technicien prépare un examen Device Support. Un collègue propose de « bypass Activation Lock avec un outil en ligne ». Réponse conforme ?',
      options: opt(
        "Refuser : seules voies Apple documentées (identifiants propriétaire, ABM, comman…",
        "Accepter si le client signe une décharge — piste peu adaptée au scénario",
        "Remplacer la carte mère sans trace (option incorrecte pour ce cas)",
        "Utiliser un profil MDM personnel du technicien sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Apple Device Support et l’éthique atelier interdisent tout contournement non documenté d’Activation Lock. L’examen teste la connaissance des voies légitimes : déverrouillage organisationnel ABM, wipe MDM sur supervisé, credentials propriétaire. Les outils tiers violent garantie et politique sécurité entreprise. Le technicien documente l’état Find My et escalade vers admin MDM. En parc de 200 iPhone, un bypass non tracé crée faille audit et responsabilité légale.',
    },
  ],
  'apps-vpp-management': [
    {
      type: 'KNOWLEDGE',
      prompt: 'Quel est le rôle principal de VPP (Volume Purchase Program) dans un déploiement d’entreprise ?',
      options: opt(
        "Acheter",
        "Remplacer le serveur MDM pour installer des apps Android sans diagnostic préalable",
        "Désactiver l’App Store sur tous les Mac personnellement sans diagnostic préalable",
        "Contourner Activation Lock sur iPhone volés sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'VPP centralise les achats volume dans Apple Business Manager ; le MDM assigne les licences et pousse InstallApplication. Aucun lien avec contournement Activation Lock ou apps Android.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un employé signale que l’app métier VPP « disparaît » après une mise à jour iOS. Première action conforme pour le support L1 ?',
      options: opt(
        "Restaurer immédiatement l’iPhone en DFU sans diagnostic préalable",
        "Vérifier Wi-Fi, profil MDM présent",
        "Supprimer le profil MDM depuis Réglages sans diagnostic préalable",
        "Créer un Apple ID personnel pour réinstaller l’app sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Le triage non destructif vérifie connectivité, gestion MDM et synchronisation avant wipe ou suppression de profil — gestes risqués sur appareil supervisé.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Sur un iPhone supervisé via ADE, une app installée par le MDM est généralement :',
      options: opt(
        "Une app gérée que l’utilisateur ne peut pas retirer comme sur un appar…",
        "Toujours téléchargeable librement sans licence VPP sans diagnostic préalable",
        "Installable uniquement via iTunes sur Windows sans diagnostic préalable",
        "Exemptée de toute commande MDM — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'La supervision permet des apps gérées persistantes ; l’utilisateur ne supprime pas librement une app Required déployée par le MDM.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Vingt iPhone affichent « En attente… » sous l’icône Teams VPP depuis 2 heures, tous sur le même Wi-Fi magasin. Cause la plus probable ?',
      options: opt(
        "Filtrage réseau ou proxy bloquant les téléchargements App Store/…",
        "Teams n’existe pas sur l’App Store sans diagnostic préalable",
        "VPP est réservé aux Mac uniquement sans diagnostic préalable",
        "Le mode Focus Dodo empêche toute installation sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Un blocage réseau local explique un échec groupé ; tester LTE ou un autre SSID isole la cause avant de suspecter licences ou matériel.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Qu’est-ce qu’une assignation de licence VPP « device-based » ?',
      options: opt(
        "La licence est liée à l’appareil, adaptée aux flottes partagées sans compte…",
        "La licence est liée au numéro IMEI du technicien sans diagnostic préalable",
        "L’utilisateur doit saisir sa carte bancaire sur chaque iPhone sans diagnostic préalable",
        "Seul Apple Diagnostics peut activer la licence sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Device-based convient aux iPad/iPhone partagés ; user-based lie la licence à un Managed Apple ID — choix admin ABM/MDM.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Après effacement supervisé ADE, l’iPhone se reconfigure mais les apps VPP mettent 30 minutes à réapparaître. Que dire au client ?',
      options: opt(
        "C’est attendu : le MDM repousse les apps au check-in une fois le Wi-Fi entrepris…",
        "L’appareil est défectueux et doit être remplacé immédiatement sans diagnostic préalable",
        "VPP ne fonctionne qu’une seule fois à vie sans diagnostic préalable",
        "Il faut jailbreaker pour accélérer (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Après setup ADE, InstallApplication s’exécute au fil des sync MDM ; patience + réseau valide avant panique ou second effacement.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quel élément le technicien L1 doit-il documenter avant d’escalader un ticket app VPP ?',
      options: opt(
        "Numéro de série, version iOS, nom app, tests réseau",
        "Mot de passe iCloud en clair sans diagnostic préalable",
        "Liste des photos personnelles de l’utilisateur sans diagnostic préalable",
        "Numéro de carte SIM du technicien sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'La traçabilité app repose sur identification appareil, contexte OS/réseau et gestion MDM — jamais de secrets d’authentification.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Toute la flotte (200 iPhone) échoue à installer une app VPP depuis hier soir. Première hypèse admin ?',
      options: opt(
        "Problème catalogue ABM, licences épuisées ou token MDM",
        "200 écrans cassés simultanément — piste peu adaptée au scénario",
        "iOS interdit désormais Teams — piste peu adaptée au scénario",
        "Chaque utilisateur a oublié son PIN en même temps sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Un échec massif synchronisé pointe vers infrastructure (VPP, MDM, réseau global), pas vers panne unitaire.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Lors d’un départ employé, le wipe sélectif des apps gérées :',
      options: opt(
        "Efface les données pro des apps MDM tout en laissant l’appareil géré selon…",
        "Supprime automatiquement le compte ABM de l’entreprise sans diagnostic préalable",
        "Désactive Find My sur tous les Mac du parc sans diagnostic préalable",
        "Installe des apps non approuvées — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Le wipe sélectif cible les données Managed Apps ; il se coordonne avec admin MDM et ne remplace pas le retrait ABM en fin de vie parc.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un collègue propose d’installer un IPA métier non signé trouvé sur un forum « pour débloquer » l’utilisateur. Réponse conforme ?',
      options: opt(
        "Refuser : seules apps approuvées via VPP/MDM ou processus B2B intern…",
        "Accepter si l’utilisateur est manager sans diagnostic préalable",
        "Installer via Finder sans trace sans diagnostic préalable",
        "Désactiver la supervision temporairement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les apps sideload non gouvernées violent la sécurité entreprise et la supervision ; escalade vers admin MDM pour distribution légitime.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen style certification : 200 iPhone supervisés perdent une app VPP Required après renouvellement token ABM. Ordre d’investigation le plus rigoureux ?',
      options: opt(
        "Vérifier validité token VPP dans ABM",
        "Restaurer chaque iPhone en DFU sans ticket (option incorrecte pour ce cas)",
        "Désactiver supervision sur toute la flotte (option incorrecte pour ce cas)",
        "Installer l’app via Apple ID personnel « pour débloquer » — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Un échec VPP synchronisé sur parc entier pointe vers token expiré, catalogue ABM ou sync MDM — pas panne unitaire. La méthode examen : valider les artefacts ABM/MDM, tester sur pilote, repush ciblé. DFU massif ou contournement Apple ID violent les bonnes pratiques entreprise et la traçabilité audit.',
      examOnly: true,
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège examen Device Support : un collègue affirme que « retirer manuellement une app gérée VPP depuis l’écran d’accueil iOS » prouve un bug MDM. Réponse la plus exacte ?',
      options: opt(
        "Sur appareil non supervisé ou app Available, l’utilisateur peut retirer l’app",
        "Toute app VPP est impossible à retirer même sur iPhone perso (option incorrecte pour ce cas)",
        "Le MDM ne contrôle jamais les apps (option incorrecte pour ce cas)",
        "Il faut jailbreak pour retirer une app (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'La distinction supervision + mode Required vs Available est centrale aux examens Apple/MDM. Une app Required sur iPhone supervisé ADE ne se comporte pas comme une app perso. Interpréter un cas isolé sans vérifier supervision, assignation et mode de licence mène à un diagnostic erroné — base des scénarios certification.',
      examOnly: true,
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen blanc : audit trimestriel — 150 iPhone supervisés, 12 % sans app métier VPP Required. Première action conforme Device Support ?',
      options: opt(
        "Exporter inventaire MDM (check-in, supervision, assignation app)",
        "Wipe immédiat des 12 % d’appareils (option incorrecte pour ce cas)",
        "Désactiver VPP sur tout le parc (option incorrecte pour ce cas)",
        "Demander à chaque utilisateur de réinstaller via App Store perso — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Un écart de conformité apps VPP se diagnostique par corrélation inventaire MDM + token ABM — pas par action destructive. Les examens Apple/MDM valorisent triage audit : preuves, pilote, repush. Wipe massif sans analyse viole runbooks entreprise.',
      examOnly: true,
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Examen blanc : quelle métrique prouve le mieux qu’une flotte iOS est prête pour un audit VPP Required ?',
      options: opt(
        "Taux d’install réussi + check-in MDM < 24 h + token VPP valide dan…",
        "Nombre d’Apple ID personnels créés par les employés sans diagnostic préalable",
        "Couleur des coques iPhone en stock sans diagnostic préalable",
        "Version iTunes sur postes Windows sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Conformité VPP Required = licences valides, commandes MDM reçues et appareils synchronisés. Les audits certification croisent install status, check-in récent et validité token — pas des indicateurs hors périmètre MDM.',
      examOnly: true,
    },
  ],
};

export const jamfProFoundationsQuestions: Record<string, SeedQuestion[]> = {
  'smart-groups-policies': [
    {
      type: 'KNOWLEDGE',
      prompt: 'À quoi sert principalement un Smart Group dans Jamf Pro ?',
      options: opt(
        "Créer un compte Apple ID consommateur sans diagnostic préalable",
        "Cibler dynamiquement des appareils selon des critères d’inventaire ou de…",
        "Remplacer le serveur APNs Apple — piste peu adaptée au scénario",
        "Héberger les sauvegardes Time Machine centralisées sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Un Smart Group se recalcule automatiquement : version OS, apps, extension, statut MDM — base du ciblage sans listes manuelles statiques.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Vous déployez Microsoft Teams sur 50 Mac pilotes avant la production. Quelle combinaison Jamf est la plus adaptée ?',
      options: opt(
        "Smart Group pilote + politique (policy) scoping le paquet ou le script…",
        "Profil Wi-Fi iOS envoyé à tous les Mac sans diagnostic préalable",
        "Suppression de tous les Smart Groups existants sans diagnostic préalable",
        "Enrollment manuel utilisateur sans MDM sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le scope par Smart Group permet de tester, mesurer les échecs et étendre progressivement — pratique standard avant déploiement global.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Une politique Jamf Pro (policy) déclenchée « Ongoing » sert surtout à :',
      options: opt(
        "Réappliquer scripts/paquets/profils tant que l’appareil reste…",
        "Remplacer Apple Business Manager sans diagnostic préalable",
        "Désactiver FileVault sur tout le parc sans diagnostic préalable",
        "Configurer uniquement les Apple Watch sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les politiques ongoing corrigent la dérive de configuration (drift) : réinstallation manquante, script de maintenance, profil renouvelé.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un admin crée un Smart Group « Tous les Mac » avec critère OS ≥ 10.13 et s’étonne que des Mac Ventura y apparaissent. Pourquoi ?',
      options: opt(
        "Jamf a un bug — Ventura n’existe pas — piste peu adaptée au scénario",
        "Le critère « supérieur ou égal » inclut toutes les versions plus récentes que 10…",
        "Les Smart Groups ne filtrent jamais par OS sans diagnostic préalable",
        "Seuls les iPhone peuvent être dans un Smart Group Mac sans diagnostic préalable"
      ),
      correctOption: 'b',
      explanation:
        'Les critères de version sont inclusifs vers le haut. Pour cibler une version exacte, utiliser plage précise ou groupes composites.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un paquet .pkg échoue sur 3 Mac du Smart Group pilote. Quelle action d’admin Jamf est la plus pertinente ?',
      options: opt(
        "Logs politique sur Mac pilote, vérifier droits/dépendances, corriger avant d’élar…",
        "Élargir immédiatement le scope à tous les ordinateurs Jamf sans diagnostic préalable",
        "Révoquer le certificat Push Apple sur le serveur sans diagnostic préalable",
        "Retirer les trois Mac pilotes d’Apple Business Manager sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les échecs de policy apparaissent dans l’historique Jamf et les logs macOS (install.log). Corriger sur pilote évite un incident de masse.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle différence entre un groupe statique et un Smart Group ?',
      options: opt(
        "Le statique est une liste fixe",
        "Le Smart Group ne peut contenir que des iPhone sans diagnostic préalable",
        "Le groupe statique se met à jour seul chaque nuit sans diagnostic préalable",
        "Aucune différence en Jamf Pro sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les groupes statiques conviennent aux exceptions nominales ; les Smart Groups automatisent le ciblage à grande échelle.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Vous devez déployer un profil SCEP pour certificats Wi-Fi 802.1X sur un Smart Group de Mac pilotes. Quelle séquence Jamf est recommandée ?',
      options: opt(
        "Créer le profil Configuration SCEP + payload Wi-Fi, scope Smart Group pilote, vérifier certificat su…",
        "Envoyer le profil Wi-Fi sans certificat à tous les ordinateurs immédiatement sans diagnostic préalable",
        "Demander à chaque utilisateur d’importer manuellement un .p12 par e-mail sans diagnostic préalable",
        "Désactiver FileVault avant tout déploiement SCEP (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Le profil SCEP établit la confiance PKI et délivre le certificat client avant ou avec le payload Wi-Fi. Jamf Pro scope le profil via Smart Group pour limiter les échecs au pilote. Vérifier dans Trousseau d’accès que le certificat est présent et valide avant d’élargir. Un déploiement massif sans pilote SCEP provoque des tickets 802.1X en cascade.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle différence entre une politique Jamf déclenchée « Enrollment Complete » et « Ongoing » ?',
      options: opt(
        "Enrollment Complete s’exécute à l’inscription",
        "Ongoing ne fonctionne que sur iPhone (option incorrecte pour ce cas)",
        "Enrollment Complete remplace Apple Business Manager sans diagnostic préalable",
        "Aucune différence — les deux triggers sont identiques sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Enrollment Complete est idéal pour paquets et profils de base au premier enrôlement ADE. Ongoing corrige la dérive : réinstalle une app manquante, relance un script ou renouvelle un profil expiré. Combiner les deux évite de surcharger l’enrôlement initial tout en maintenant la conformité. Choisir le mauvais trigger explique souvent « policy ne s’applique pas » malgré un check-in récent.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel endpoint API Jamf Pro moderne permet de lister l’inventaire enrichi des Mac avec filtres (ex. osVersion) ?',
      options: opt(
        "GET /api/v1/computers-inventory avec paramètres section",
        "POST /api/v1/delete-all-devices sans diagnostic préalable",
        "GET /api/v1/apple-push-cert/download-only sans diagnostic préalable",
        "PUT /api/v1/users/reset-password sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’API Jamf Pro v1 expose computers-inventory et mobile-devices-inventory pour l’inventaire moderne. Authentification OAuth Bearer token ou compte API selon configuration. Les filtres permettent d’automatiser exports conformité sans cliquer dans l’UI. Classic API (/JSSResource) existe encore mais inventory endpoints v1 sont privilégiés pour reporting. Documentez token scopes minimum. Référence : developer.jamf.com. Automatisation utile avant audit sur parc 200 Mac.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Déploiement VPP de Microsoft Teams sur Smart Group pilote iOS : 8/10 réussissent, 2 restent Pending. Action admin Jamf ?',
      options: opt(
        "Vérifier licences VPP, assignation device-based, logs commande InstallApplication",
        "Supprimer le Smart Group et tout envoyer à All Mobile Devices sans diagnostic préalable",
        "Révoquer le certificat Push (option incorrecte pour ce cas)",
        "Désactiver la supervision sur les 2 iPhone (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Un échec partiel sur pilote indique problème device-specific ou licence, pas policy globale. Jamf affiche statut MDM command et erreur éventuelle. VPP requiert token actif et licences suffisantes assignées au mode device pour flotte partagée. Vérifiez aussi connectivité CDN Apple. Corrigez sur les 2 appareils avant d’élargir aux 200 iPhone production. Elargir scope immédiatement multiplierait les échecs.',
    },
  ],
  'inventory-basics': [
    {
      type: 'SCENARIO',
      prompt:
        'Un Mac signale « Non conforme » dans Jamf à cause d’une extension système manquante (agent sécurité). Où investiguer en premier ?',
      options: opt(
        "Fiche inventaire du Mac : extensions, politiques en échec, dernière ch…",
        "Console ABM uniquement (option incorrecte pour ce cas)",
        "App Réglages > Safari sur l’iPhone du même utilisateur sans diagnostic préalable",
        "Portail Microsoft 365 (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'L’inventaire Jamf agrège extensions, profils et statut de conformité — point central avant d’ouvrir un ticket ou relancer une policy.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Que signifie généralement un Mac « non géré » (unmanaged) dans Jamf Pro ?',
      options: opt(
        "L’appareil n’a plus d’enrôlement MDM actif ou a été retiré",
        "Le Mac est neuf dans ABM mais pas encore assigné",
        "FileVault est activé sans diagnostic préalable",
        "Le Mac est en mode Recovery sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Unmanaged indique absence de canal MDM : retrait utilisateur, wipe, ou échec d’enrôlement — à distinguer d’un appareil ABM non assigné.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Trois Mac ont alertes : disque >95 % plein, macOS 12 alors que la politique exige 14, agent MDM absent. Priorisation ?',
      options: opt(
        "Agent MDM d’abord (visibilité),, OS,",
        "Ignorer jusqu’à la prochaine audit annuelle sans diagnostic préalable",
        "Formater les trois Mac le même jour sans diagnostic préalable",
        "Désactiver toutes les politiques de conformité sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Sans agent MDM, les corrections à distance sont limitées. Remettre sous gestion puis planifier mises à jour et nettoyage disque est la séquence la plus sûre.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : l’inventaire Jamf affiche « Dernière check-in : il y a 2 minutes » mais la policy ne s’applique pas. Cause fréquente ?',
      options: opt(
        "Scope de politique incorrect, fenêtre de maintenance, ou politique en éch…",
        "APNs toujours invalide si check-in récent sans diagnostic préalable",
        "Le Mac n’est pas allumé (option incorrecte pour ce cas)",
        "Jamf ne supporte pas les policies — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Un check-in récent prouve la connectivité Push. Vérifier scope, triggers (Enrollment Complete vs Ongoing) et logs d’exécution de la policy.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel champ inventaire Jamf aide à identifier rapidement les Mac sans FileVault activé ?',
      options: opt(
        "Statut FileVault / Personal Recovery Key dans la section…",
        "Couleur du boîtier sans diagnostic préalable",
        "Numéro de téléphone de l’utilisateur sans diagnostic préalable",
        "Version watchOS — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Les critères de conformité et Smart Groups s’appuient sur ces champs pour cibler le chiffrement obligatoire.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Direction demande un export des Mac hors conformité OS pour un comité sécurité. Quelle fonction Jamf utiliser ?',
      options: opt(
        "Recherche avancée ou Smart Group « Non conformes OS » + ex…",
        "Supprimer les Mac non conformes du MDM sans diagnostic préalable",
        "Réinitialiser les mots de passe Apple ID sans diagnostic préalable",
        "Exporter uniquement les iPhone sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les recherches sauvegardées et exports CSV alimentent les revues de conformité sans action destructive sur le parc.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un Smart Group « Mac conformes FileVault » inclut 200 appareils, mais 12 Mac récents n’y figurent pas malgré FileVault activé. Cause la plus probable ?',
      options: opt(
        "Délai d’inventaire : le statut FileVault n’a pas encore été remonté au prochain…",
        "FileVault désactive automatiquement la gestion Jamf sans diagnostic préalable",
        "Les Smart Groups ne peuvent pas filtrer sur le chiffrement sans diagnostic préalable",
        "Jamf Pro ne remonte jamais l’état FileVault sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’inventaire Jamf se met à jour à chaque check-in. Un Mac nouvellement chiffré peut mettre quelques minutes à apparaître dans le critère de conformité.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel indicateur Jamf Pro signale qu’un Mac pourrait perdre prochainement la gestion MDM si aucune action n’est prise ?',
      options: opt(
        "Check-in MDM ancienne (>48 h) combinée à absence de rapport inventair…",
        "Couleur du boîtier « Space Gray » sans diagnostic préalable",
        "Présence de Xcode installé — piste peu adaptée au scénario",
        "FileVault activé avec clé de récupération escrowed sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Un Mac qui ne check-in plus peut sortir silencieusement du périmètre de déploiement. Jamf affiche la dernière communication MDM sur la fiche appareil. Croiser avec politiques en attente et extensions manquantes priorise les actions avant qu’un utilisateur ne signale une panne. FileVault escrowed est généralement un signe positif de conformité, pas d’alerte.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel champ inventaire Jamf Pro aide à détecter un iPhone potentiellement compromis (jailbreak) ?',
      options: opt(
        "Indicateur jailbreak / compromised dans section Security ou extens…",
        "Couleur du boîtier dans Hardware sans diagnostic préalable",
        "Prénom de l’utilisateur dans General sans diagnostic préalable",
        "Version Xcode installée — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Jamf remonte le statut jailbreak via inventaire iOS lorsque disponible. Smart Groups « jailbreak true » isolent appareils à risque pour wipe ou ticket sécurité. Croisez avec dernière check-in : un jailbreak récent sans check-in empêche remédiation à distance. En parc 200 iPhone, export Advanced Mobile Device Search alimente comité sécurité. Ne confondez pas avec supervised flag — un appareil supervisé peut être jailbreaké si exploit post-enrollment.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Inventaire Jamf : 15 Mac présents ABM mais absents de Jamf après 7 jours. Première hypothèse ?',
      options: opt(
        "Échec ADE au Setup Assistant, mauvaise assignation serveur MDM dans ABM,…",
        "Les Mac sont forcément volés — piste peu adaptée au scénario",
        "FileVault empêche l’inventaire Jamf sans diagnostic préalable",
        "Jamf ne gère pas les Mac Apple Silicon sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'ABM assigne au serveur MDM ; Jamf synchronise via token. Si utilisateur termine setup sans réseau ou PreStage incorrect, Mac finit non géré. Vérifiez assignation ABM → Jamf, validité token MDM, logs enrollment. Comparez serialNumber ABM vs recherche Jamf. Scenario fréquent réception 20 Mac neufs : un mauvais PreStage laisse machines hors MDM. Pas de wipe massif — corriger assignation et réeffacer pilote.',
    },
  ],
  'enrollment-apple-integration': [
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel prérequis permet à Jamf Pro de synchroniser les appareils assignés depuis Apple Business Manager ?',
      options: opt(
        "Jeton serveur MDM Apple (MDM Server Token) valide dans…",
        "Compte iCloud @gmail.com partagé sans diagnostic préalable",
        "Profil Wi-Fi manuel sur chaque Mac sans diagnostic préalable",
        "Licence Microsoft 365 Business Basic sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le jeton MDM établit la confiance ABM ↔ Jamf. Sans lui, aucune synchronisation d’inventaire ni d’assignation automatique.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Pourquoi le certificat APNs (Apple Push Notification service) est-il indispensable dans Jamf Pro ?',
      options: opt(
        "Il permet au serveur d’envoyer les commandes MDM aux appareils g…",
        "Il remplace le chiffrement FileVault sans diagnostic préalable",
        "Il installe automatiquement Xcode sans diagnostic préalable",
        "Il sert uniquement aux notifications mail Outlook sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'MDM repose sur Push : sans certificat APNs valide, check-in et déploiements échouent même si l’enrôlement semble réussi.',
    },
    {
      type: 'SCENARIO',
      prompt:
        '20 Mac neufs arrivent dans ABM. Quelle séquence d’enrôlement ADE est correcte ?',
      options: opt(
        "Vérifier jeton MDM + APNs → assigner appareils au serveur Jamf dans ABM → activer un Mac test → valider Pre…",
        "Demander à chaque utilisateur d’installer Jamf Self Service depuis l’App Store sans ABM sans diagnostic préalable",
        "Activer les Mac hors ligne sans Wi-Fi (option incorrecte pour ce cas)",
        "Créer des comptes locaux admin « admin/admin » (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'L’ADE automatise supervision et MDM au Setup Assistant — à condition que l’assignation ABM et les profils PreStage soient prêts.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel objet Jamf configure l’expérience Setup Assistant et la supervision au premier démarrage ?',
      options: opt(
        "PreStage Enrollment / profil Automated Device Enrol…",
        "Politique de fond d’écran uniquement sans diagnostic préalable",
        "Extension Safari sans diagnostic préalable",
        "Compte réseau Open Directory sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le PreStage définit supervision, compte admin local, packages à l’installation et étapes masquées de l’assistant.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un Mac supervisé via Jamf peut-il recevoir des restrictions impossibles sur un appareil non supervisé ?',
      options: opt(
        "Non — supervision et non-supervision ont les mêmes capacités MDM sans diagnostic préalable",
        "Oui, la supervision débloque des payloads",
        "Oui, mais uniquement sur Android (option incorrecte pour ce cas)",
        "Non — seul l’utilisateur peut tout configurer — piste peu adaptée au scénario"
      ),
      correctOption: 'b',
      explanation:
        'La supervision Apple élargit le périmètre MDM (Kiosk, filtres, etc.). Un Mac user-approved enrollment a des limites par conception.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Le certificat Push Jamf expire dans 14 jours. Quelle action évite une coupure de gestion ?',
      options: opt(
        "Renouveler le certificat APNs dans le portail Apple",
        "Attendre l’expiration puis réenrôler manuellement 500 Mac sans diagnostic préalable",
        "Désactiver le MDM sur tout le parc (option incorrecte pour ce cas)",
        "Changer uniquement le mot de passe admin Jamf sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Un Push expiré stoppe les commandes. Le renouvellement proactif préserve le même topic APNs et évite une réenrôlement massif.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Dans un profil PreStage Jamf, quel paramètre ADE garantit que l’utilisateur ne peut pas ignorer l’inscription MDM au Setup Assistant ?',
      options: opt(
        'Mandatory MDM enrollment / enrôlement MDM obligatoire dans le PreStage',
        'Autoriser la création d’un compte Apple ID personnel obligatoire',
        'Désactiver le Wi-Fi au premier démarrage',
        'Masquer uniquement l’écran « Siri » sans lien avec le MDM'
      ),
      correctOption: 'a',
      explanation:
        'Le PreStage Enrollment définit l’expérience ADE : supervision, comptes locaux, packages et obligation MDM. Sans enrôlement obligatoire, un utilisateur pourrait terminer l’assistant sans gestion. Les options de skip d’écrans Setup Assistant se configurent dans le même objet. Tester sur un Mac vierge ABM avant production évite les surprises en classe ou en open space.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Après renouvellement du jeton serveur MDM Apple, les nouveaux Mac ABM n’apparaissent plus dans Jamf Pro. Première vérification ?',
      options: opt(
        "Validité",
        "Réinstallation de Jamf Admin sur le poste du technicien uniquement sans diagnostic préalable",
        "Changement du mot de passe Apple ID personnel (option incorrecte pour ce cas)",
        "Suppression de tous les PreStage existants (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Le jeton MDM lie Apple Business Manager à Jamf Pro pour synchroniser inventaire et assignations. Un jeton expiré ou non réimporté bloque les nouveaux appareils sans affecter nécessairement les déjà enrôlés. ABM doit toujours assigner les appareils au serveur Jamf correct. Supprimer les PreStage serait destructif et ne résout pas un problème de jeton.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Combien de temps avant expiration faut-il planifier le renouvellement du certificat Push APNs Jamf en production ?',
      options: opt(
        "30 à 45 jours — tester import avant date d’expiration effective",
        "La veille à minuit sans test sans diagnostic préalable",
        "Uniquement après coupure constatée sur 200 appareils",
        "Tous les 10 ans (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Le certificat Push expire typiquement annuellement. Jamf affiche date dans Settings → Apple Push Certificates. Renouvellement via même Apple ID sur identity.apple.com conserve topic APNs. Fenêtre 30-45 jours laisse temps test pilote et rollback. Expiration provoque check-in stale groupée — impact parc entier. Documentez runbook partagé avec équipe ABM. Ne pas confondre avec token serveur MDM ABM — deux renouvellements distincts.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Jeton serveur MDM Apple Jamf renouvelé lundi ; mardi, nouveaux iPhone ABM n’apparaissent pas dans Jamf. Vérification ?',
      options: opt(
        "Upload nouveau MDM Server Token dans Jamf, import dans ABM",
        "Réinstaller Jamf Admin sur poste technicien uniquement sans diagnostic préalable",
        "Changer mot de passe Apple ID personnel (option incorrecte pour ce cas)",
        "Supprimer tous les PreStage (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Token MDM lie ABM à Jamf pour sync inventaire et ADE. Token expiré ou mal réimporté bloque nouveaux appareils sans affecter nécessairement existants. ABM doit assigner iPhone au serveur Jamf correct. Supprimer PreStage serait destructif. Vérifiez date expiration dans les deux consoles. Test : assigner iPhone labo ABM et observer apparition Jamf sous 15 min. Critique avant réception 200 iPhone.',
    },
  ],
  'api-automation-advanced-policies': [
    {
      type: 'KNOWLEDGE',
      prompt: 'Quel mécanisme d’authentification privilégier pour l’API REST Jamf Pro moderne en automation ?',
      options: opt(
        'OAuth client credentials (Bearer token) avec scopes minimum',
        'Mot de passe admin Jamf en clair dans le script cron',
        'Session cookie navigateur copié depuis Jamf Admin',
        'Compte Apple ID personnel de l’utilisateur'
      ),
      correctOption: 'a',
      explanation:
        'OAuth API Clients permet rotation, scopes granulaires et audit distinct des comptes humains. Ne jamais hardcoder mot de passe admin.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un script exporte l’inventaire Mac non conformes OS chaque lundi. Quel endpoint Jamf Pro v1 utiliser en priorité ?',
      options: opt(
        "GET /api/v1/computers-inventory avec filtres sur osVersion",
        "Classic API /JSSResource/users uniquement sans diagnostic préalable",
        "Endpoint Jamf Connect cloud sans lien inventaire sans diagnostic préalable",
        "Apple Configurator USB export sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'computers-inventory est l’API enrichie recommandée pour reporting et filtres ; Classic API reste legacy pour certains objets.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'À quoi sert un Extension Attribute (EA) calculé par script dans Jamf Pro ?',
      options: opt(
        "Enrichir l’inventaire avec une valeur custom pour Smart Groups",
        "Remplacer le certificat Push Apple sans diagnostic préalable",
        "Désactiver FileVault à distance sans MDM sans diagnostic préalable",
        "Convertir un iPhone en appareil Android sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les EA remontent des signaux locaux (patch, agent EDR, certificat) et alimentent membership dynamique Smart Groups.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un EA exécute un scan disque complet à chaque check-in. Symptôme utilisateur le plus probable ?',
      options: opt(
        "Mac/iPhone lent, check-in MDM rallongé, utilisateurs se plaignen…",
        "Activation Lock déclenché automatiquement sans diagnostic préalable",
        "Smart Group vide systématiquement sans diagnostic préalable",
        "Certificat Push renouvelé seul sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Scripts EA lourds dégradent l’expérience ; préférez scripts légers ou fréquence limitée.',
    },
    {
      type: 'SCENARIO',
      prompt:
        '45 iPhone affichent Teams VPP Pending après changement proxy vendredi. Action automation la plus pertinente après correction réseau ?',
      options: opt(
        "Repush InstallApplication ou RefreshMobileDevice via API sur Smart Group…",
        "EraseDevice via API sur les 45 appareils immédiatement sans diagnostic préalable",
        "Supprimer le certificat Push Jamf — piste peu adaptée au scénario",
        "Désinstaller Jamf Pro du serveur — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Pending massif + cause réseau résolue → repush MDM ciblé, pas wipe. API permet bulk sur Smart Group après validation.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quelle différence entre politique Jamf « Enrollment Complete » et « Ongoing » pour l’automation ?',
      options: opt(
        "Enrollment Complete = bootstrap initial, Ongoing = maintenance récurrente",
        "Ongoing ne s’exécute qu’une seule fois à vie sans diagnostic préalable",
        "Enrollment Complete remplace le certificat APNs sans diagnostic préalable",
        "Aucune différence en Jamf Cloud — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Ongoing planifie scripts/paquets périodiques ; Enrollment Complete cible le fenêtre post-enrôlement uniquement.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Direction exige journalisation de chaque wipe MDM déclenché par script. Quelle bonne pratique API ?',
      options: opt(
        "Pipeline CI avec approbation, compte API dédié, logs centralisés",
        "Partager le token OAuth dans un canal Teams public sans diagnostic préalable",
        "Utiliser compte admin personnel sans traçabilité sans diagnostic préalable",
        "Désactiver toute API Jamf (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'EraseDevice est destructif ; garde-fous workflow + compte service + audit trail sont obligatoires en enterprise.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Que faire face à une réponse HTTP 429 lors d’appels API Jamf Cloud en batch ?',
      options: opt(
        "Backoff exponentiel, pagination plus petite, étaler les requêt…",
        "Relancer immédiatement 10 000 requêtes par seconde",
        "Changer le topic certificat Push sans diagnostic préalable",
        "Effacer l’inventaire Jamf sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Jamf Cloud rate-limit ; respecter limites et batch intelligemment évite blocage automation.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Webhook Jamf configuré mais Slack ne reçoit rien quand Smart Group membership change. Première vérification ?',
      options: opt(
        "URL endpoint HTTPS accessible, certificat TLS valide, secret webhook",
        "Réinstallation Safari sur Mac admin sans diagnostic préalable",
        "Renouvellement token VPP ABM — piste peu adaptée au scénario",
        "Changement mot de passe utilisateur final iPhone sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Webhooks exigent endpoint reachable, 200 OK, parfois auth header ; tester avec curl depuis labo.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Audit ISO dans 48 h — 200 Mac, export non conformes OS requis. Solution la plus scalable ?',
      options: opt(
        "Script planifié OAuth → computers-inventory filtré → CSV/Power BI automatique",
        "Capture manuelle écran par écran dans Jamf Admin sans diagnostic préalable",
        "Demander à chaque utilisateur son numéro de version macOS par email",
        "Désactiver Smart Groups existants — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Automation API standardise reporting, réduit erreur humaine et prépare audits récurrents sans effort manuel.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen Jamf Certified Admin : un script OAuth appelle EraseDevice sur une Smart Group « Non compliant OS » sans garde-fou. Quelle réponse d’architecture est la plus conforme ?',
      options: opt(
        "Workflow avec approbation humaine, compte API à scopes minimum, dry-run inventaire",
        "Token OAuth partagé dans un wiki interne pour « aller plus vite » — piste peu adaptée au scénario",
        "EraseDevice immédiat car le script est signé par un admin (option incorrecte pour ce cas)",
        "Désactiver toutes les Smart Groups pour stopper le script (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Les examens Jamf et les audits ISO exigent séparation des privilèges et traçabilité sur commandes destructives. EraseDevice via API sans pipeline d’approbation viole les bonnes pratiques enterprise. Dry-run + scopes minimum + logs sont le modèle attendu en certification admin.',
      examOnly: true,
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège examen : après migration Classic API → v1 computers-inventory, un rapport hebdo affiche 0 Mac alors que Jamf Admin en liste 200. Cause la plus probable ?',
      options: opt(
        "Filtres OAuth scopes, pagination ou critères de requête v1 incorrects",
        "Les 200 Mac ont été effacés simultanément sans diagnostic préalable",
        "Jamf Cloud a perdu la licence Apple Push sans diagnostic préalable",
        "Les Mac sont devenus des iPhone (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Les scénarios certification Jamf testent la maîtrise API v1 : scopes OAuth, pagination, filtres RSQL. Un export vide avec inventaire UI intact signale quasi toujours une requête mal formée — compétence clé Jamf Certified Admin et audits automation.',
      examOnly: true,
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen blanc Jamf : reporting conformité ISO — 180 Mac, 15 % OS obsolète. Livrable le plus attendu en audit ?',
      options: opt(
        "Export computers-inventory filtré + Smart Group « Non compliant OS » + plan…",
        "Capture d’écran Jamf Admin sans métadonnées sans diagnostic préalable",
        "Liste manuelle des prénoms utilisateurs sans diagnostic préalable",
        "Suppression des Mac non conformes sans ticket sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Reporting et conformité Jamf reposent sur inventaire API, groupes dynamiques et traçabilité des actions correctives. Les examens Jamf Certified Admin testent l’automation reproductible — pas des exports ad hoc non vérifiables.',
      examOnly: true,
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Examen blanc : quel objet Jamf Pro alimente le mieux un tableau de bord « appareils non conformes + dernière check-in » ?',
      options: opt(
        "Smart Group basé sur critères OS/conformité + Extension Attribut…",
        "Compte utilisateur local macOS uniquement sans diagnostic préalable",
        "Profil Wi-Fi iOS envoyé aux Mac sans diagnostic préalable",
        "Token VPP Apps and Books seul sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Smart Groups et EA calculés sont le cœur du reporting conformité Jamf : membership dynamique, policies ciblées et exports API cohérents. Distinction clé certification vs inventaire statique.',
      examOnly: true,
    },
  ],
};

export const intuneIosEnrollmentQuestions: Record<string, SeedQuestion[]> = {
  'ade-enrollment-basics': [
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel prérequis relie Apple Business Manager à Microsoft Intune pour les appareils supervisés ?',
      options: opt(
        "Jeton serveur MDM Apple téléchargé depuis ABM",
        "Compte Gmail partagé par l’école sans diagnostic préalable",
        "Profil Wi-Fi créé à la main sur chaque iPad sans diagnostic préalable",
        "Licence Jamf Pro — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Le jeton MDM authentifie Intune auprès d’Apple et synchronise l’inventaire ABM pour l’ADE.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Un profil ADE (Enrollment Program) dans Intune permet notamment de :',
      options: opt(
        "Imposer la supervision",
        "Installer des apps Android sans diagnostic préalable",
        "Remplacer Entra ID sans diagnostic préalable",
        "Désactiver le chiffrement BitLocker sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les profils ADE contrôlent l’expérience première main : compte admin, skip d’écrans, rattachement MDM obligatoire.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Où créer le profil d’inscription des appareils iOS pour l’ADE dans le centre d’administration Intune ?',
      options: opt(
        "Appareils > iOS/iPadOS > Profils d’inscription > Profils d’inscrip…",
        "Applications > VPP uniquement sans diagnostic préalable",
        "Rapports > Audit des connexions Entra sans diagnostic préalable",
        "Endpoint security > Antivirus Mac sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'C’est le chemin standard pour lier un profil ADE aux appareils ABM synchronisés.',
    },
    {
      type: 'SCENARIO',
      prompt:
        '30 iPad neufs sont dans ABM mais n’apparaissent pas dans Intune. Vérification prioritaire ?',
      options: opt(
        "Assignation des appareils au serveur MDM Intune dans ABM",
        "Réinstallation de Teams sur le PC admin sans diagnostic préalable",
        "Changement du fond d’écran — piste peu adaptée au scénario",
        "Création d’un groupe de sécurité Exchange on-prem sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Sans assignation MDM dans ABM, Intune ne « voit » pas les appareils. Le jeton expiré bloque aussi la synchronisation.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : un collègue affirme que l’ADE « enrôle automatiquement sans Wi-Fi au premier démarrage ». Quelle nuance est correcte ?',
      options: opt(
        "ADE rattache au MDM au Setup Assistant, le réseau reste requis pour profils, apps",
        "Aucune connexion réseau n’est jamais nécessaire sur iOS supervisé sans diagnostic préalable",
        "L’ADE ne fonctionne que sur macOS, pas sur iPhone ni iPad sans diagnostic préalable",
        "Une carte SIM Android est obligatoire pour l’inscription sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’automatisme porte sur l’enrôlement MDM et la supervision ; le téléchargement des ressources Intune exige toujours Internet.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Après assignation ABM → Intune, que se passe-t-il au premier allumage d’un iPad ?',
      options: opt(
        'Setup Assistant applique le profil ADE et inscrit l’iPad dans Intune',
        'L’iPad reste non géré jusqu’à inscription manuelle Company Portal',
        'Seule la création d’un Apple ID personnel est proposée',
        'Intune désinstalle automatiquement toutes les applications'
      ),
      correctOption: 'a',
      explanation:
        'L’ADE garantit un enrôlement zero-touch supervisé — distinct de l’inscription BYOD via Company Portal.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un profil ADE Intune doit masquer l’écran « Localiser mon iPhone » au Setup Assistant. Où configurer cette option ?',
      options: opt(
        "Dans le profil d’inscription des appareils ADE",
        "Dans une politique de conformité iOS uniquement sans diagnostic préalable",
        "Dans le portail Apple ID personnel de l’utilisateur sans diagnostic préalable",
        "Via une app Jamf Self Service sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les écrans masqués ou imposés se définissent dans le profil ADE ; la conformité intervient après l’enrôlement.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : le jeton serveur MDM Apple dans Intune expire dans 5 jours. Risque principal si non renouvelé ?',
      options: opt(
        "Perte de synchronisation ABM, blocage des nouveaux enrôlements ADE",
        "Suppression automatique de tous les profils Wi-Fi iOS",
        "Désactivation du chiffrement BitLocker sur les PC sans diagnostic préalable",
        "Réinitialisation des mots de passe Entra ID sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Sans jeton MDM valide, Intune ne peut plus synchroniser l’inventaire ABM ni recevoir de nouveaux appareils ADE.',
    },

    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle différence entre certificat Apple MDM Push Intune et Enrollment Program Token ABM ?',
      options: opt(
        "Push cert autorise commandes MDM via APNs, token ABM synchronise inventaire",
        "Les deux fichiers sont identiques et interchangeables sans diagnostic préalable",
        "Token ABM remplace Conditional Access (option incorrecte pour ce cas)",
        "Push cert sert uniquement à BitLocker (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Deux artefacts distincts : Push certificate (identity.apple.com) pour canal MDM temps réel ; Enrollment Program Token téléchargé depuis Intune importé dans ABM pour liaison organisationnelle. Expiration de l’un n’implique pas expiration de l’autre — deux alertes calendrier requis. Nouveaux ADE bloqués si token ABM expiré même si Push valide. Documentation Microsoft Learn détaille renouvellement séparé. Erreur fréquente débutants Intune iOS.',
    },
    {
      type: 'SCENARIO',
      prompt:
        '200 iPhone assignés Intune dans ABM ; Setup Assistant boucle sur « Unable to activate ». Piste prioritaire ?',
      options: opt(
        "Connectivité réseau/DNS vers Apple",
        "Révoquer toutes licences M365 (option incorrecte pour ce cas)",
        "Installer Jamf Pro en parallèle sans config sans diagnostic préalable",
        "Désactiver supervision dans ABM manuellement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Activation iPhone requiert contact serveurs Apple. ADE ajoute contact Intune. Pare-feu bloquant ou DNS interne incorrect cause échec activation ou Remote Management. Vérifiez aussi certificats et token non expirés. Date/heure auto essentielle. Testez iPhone pilote sur réseau guest puis corporate. Scénario 200 devices : résoudre infra avant déploiement masse. Désactiver supervision compromet modèle Zero Trust.',
    },
  ],
  'compliance-policies': [
    {
      type: 'KNOWLEDGE',
      prompt: 'À quoi sert une politique de conformité Intune pour iOS/iPadOS ?',
      options: opt(
        "Évaluer PIN, version OS, jailbreak, etc., avant d’accorder l’accè…",
        "Remplacer Apple Business Manager sans diagnostic préalable",
        "Publier des apps sur l’App Store public sans diagnostic préalable",
        "Configurer un domaine DNS public sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'La conformité produit un état reporté à Entra ID pour Conditional Access et actions de remédiation.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un iPhone est « Non conforme » et perd l’accès Outlook. CA exige appareil conforme. Première étape admin ?',
      options: opt(
        "Ouvrir le rapport de conformité Intune pour l’appareil",
        "Supprimer le tenant Entra ID — piste peu adaptée au scénario",
        "Révoquer toutes les licences Microsoft 365 sans diagnostic préalable",
        "Désactiver le Wi-Fi entreprise globalement sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le détail par règle (OS min, PIN, jailbreak) oriente la remédiation ciblée plutôt qu’une action massive.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quelle règle Intune détecte typiquement un appareil iOS jailbreaké ?',
      options: opt(
        'Compromission de l’appareil (Jailbroken)',
        'Espace de stockage faible uniquement',
        'Version du navigateur Safari',
        'Langue du clavier'
      ),
      correctOption: 'a',
      explanation:
        'La compromission déclenche souvent blocage immédiat — politique courante en environnement réglementé.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un iPad n’a pas de code d’accès alors que la politique exige un PIN à 6 chiffres. Action Intune adaptée ?',
      options: opt(
        "Marquer non conforme, notification utilisateur, délai de grâce",
        "Effacer le tenant (option incorrecte pour ce cas)",
        "Désinscrire tous les appareils Android sans diagnostic préalable",
        "Ignorer car l’iPad est supervisé sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les délais de grâce laissent le temps de se conformer ; ensuite CA bloque l’accès aux données corporate.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : la conformité affiche « En attente » depuis 48 h sur un iPhone. Cause probable ?',
      options: opt(
        "Appareil hors ligne, pas de check-in Intune, ou stratégie non assignée a…",
        "Le PIN est trop long (option incorrecte pour ce cas)",
        "L’utilisateur a trop de points sur le leaderboard sans diagnostic préalable",
        "Le certificat APNs Jamf a expiré — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'L’évaluation repose sur le canal MDM Intune. Sans communication récente ou assignation, l’état reste indéterminé.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle action destructive Intune peut appliquer après plusieurs jours de non-conformité (si configurée) ?',
      options: opt(
        "Effacement sélectif ou complet (retrait) selon les paramètres de…",
        "Mise à jour automatique de macOS sur PC sans diagnostic préalable",
        "Création d’un compte admin local sur le Mac sans diagnostic préalable",
        "Installation de Chrome OS — piste peu adaptée au scénario"
      ),
      correctOption: 'a',
      explanation:
        'Les actions de non-conformité sont progressives : notification, blocage mail, puis retrait ou effacement si défini.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Une politique de conformité Intune exige iOS 17 minimum. Un iPhone 16 est bloqué par Conditional Access. Comment prioriser la remédiation ?',
      options: opt(
        "Rapport conformité : règle OS en échec, notifier, planifier MAJ iOS avant fin du délai d…",
        "Supprimer le compte Entra ID de l’utilisateur sans diagnostic préalable sans diagnostic préalable",
        "Désactiver toutes les politiques de conformité du tenant Intune sans diagnostic préalable",
        "Révoquer le certificat APNs Jamf (hors périmètre Intune) sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Le rapport de conformité Intune détaille quelle règle échoue (version OS, PIN, jailbreak). Conditional Access s’appuie sur cet état remonté à Entra ID. Un délai de grâce laisse le temps de mettre à jour avant blocage complet. Agir sur le compte utilisateur ou désactiver globalement les politiques est disproportionné pour un écart de version OS.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel lien entre politique de conformité Intune et Conditional Access dans Entra ID ?',
      options: opt(
        "La conformité Intune alimente le signal « appareil conforme » utilisé par les stratég…",
        "Conditional Access remplace entièrement les politiques de conformité sans diagnostic préalable",
        "Les deux sont indépendants et ne partagent aucun état sans diagnostic préalable",
        "Conditional Access ne s’applique qu’aux appareils Android sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Intune évalue PIN, OS, jailbreak et autres critères, puis publie l’état dans Entra ID. Conditional Access peut exiger « appareil conforme » pour autoriser Exchange ou SharePoint. Sans assignation correcte des deux côtés, l’utilisateur reste bloqué malgré une apparence de configuration. Tester sur un appareil pilote valide la chaîne conformité → CA.',
    },

    {
      type: 'SCENARIO',
      prompt:
        'iPhone jailbreaké détecté par conformité Intune à 09h00. Action alignée Zero Trust ?',
      options: opt(
        "Marquer non conforme immédiatement, bloquer CA M365, ticket sécurité, envisager…",
        "Attendre 30 jours de grace period standard OS sans diagnostic préalable",
        "Ignorer car l’utilisateur est direction — piste peu adaptée au scénario",
        "Désactiver toutes politiques conformité du tenant sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Jailbreak compromet Secure Enclave et contrôles MDM — pas de délai négociable en environnement réglementé. Intune signale non compliant → Entra CA bloque Exchange/Teams. Sécurité évalue wipe full ou retire selon classification données. Grace period réservée OS patchable ou PIN oublié avec MFA recovery. Sur parc 200 iPhone, un jailbreak peut indiquer pattern — cherchez autres devices même utilisateur. Documentez incident.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle action Intune « Actions for noncompliance » permet un effacement factory sur iPhone corporate après escalade ?',
      options: opt(
        "Retire / Remote wipe (full wipe) configuré après délais progre…",
        "Uniquement changement fond d’écran sans diagnostic préalable",
        "Réinitialisation mot de passe Entra automatique sans diagnostic préalable",
        "Installation Chrome OS Flex sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Intune permet chaîne progressive : notification email, mark noncompliant, block access via CA, puis retire/wipe. Full wipe efface appareil ; sur ADE supervisé, prochain setup reprovisionne si toujours ABM. Selective wipe cible données MAM sur BYOD. Configurez délais selon sensibilité — jailbreak souvent sans grace. Testez sur iPhone labo avant production. Alignez avec legal/HR pour COPE.',
    },
  ],
  'app-protection-conditional-access': [
    {
      type: 'KNOWLEDGE',
      prompt: 'Quelle différence clé entre MAM (App Protection) et MDM complet sur iOS ?',
      options: opt(
        "MAM protège les données dans les apps M365 sans contrôle total…",
        "MAM remplace le certificat Push Apple sans diagnostic préalable",
        "MAM ne s’applique qu’aux PC Windows sans diagnostic préalable",
        "MAM empêche toute connexion Internet sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'App Protection isole données corporate (conteneur) — idéal BYOD où l’utilisateur refuse un enrôlement complet.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Direction exige que seuls Outlook/Teams « managés » accèdent à Exchange Online. Quel duo configurer ?',
      options: opt(
        "Politique App Protection iOS + Conditional Access « apps approuvées / exige…",
        "Profil Wi-Fi guest uniquement (option incorrecte pour ce cas)",
        "Désactiver MFA (option incorrecte pour ce cas)",
        "Partager le mot de passe service dans Teams sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'MAM sécurise l’app ; CA applique la politique d’accès au niveau Entra — combinaison standard M365.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel paramètre App Protection limite le copier-coller de données professionnelles vers Notes/WhatsApp personnels ?',
      options: opt(
        "Transfert de données restreint (Restrict cut/copy/pas…",
        "Mode avion obligatoire sans diagnostic préalable",
        "Rotation d’écran forcée sans diagnostic préalable",
        "Désactivation du Bluetooth sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'La restriction de transfert maintient les données dans le conteneur géré et réduit les fuites accidentelles.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un consultant BYOD ouvre Outlook après inscription MAM. Quelle exigence renforce l’accès au contenu ?',
      options: opt(
        'PIN ou biométrie au niveau application avant affichage des mails',
        'Désinstallation de Safari',
        'Compte Apple ID de l’entreprise sur l’App Store familial',
        'Jailbreak obligatoire'
      ),
      correctOption: 'a',
      explanation:
        'Le verrouillage applicatif complète le contrôle même lorsque l’appareil n’est pas entièrement supervisé par MDM.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : Conditional Access bloque un iPhone « conforme Intune » mais MAM non appliqué à Outlook. Cause fréquente ?',
      options: opt(
        "Politique App Protection non assignée au utilisateur/app ou clien…",
        "Le Wi-Fi 6 est trop rapide sans diagnostic préalable",
        "L’iPhone est supervisé — piste peu adaptée au scénario",
        "Le certificat APNs est renouvelé sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'CA « exiger app protégée » nécessite qu’Outlook reçoive et applique la politique MAM — vérifier assignation et version d’app.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quel signal Entra ID utilise Conditional Access pour un appareil iOS géré par Intune ?',
      options: opt(
        "État de conformité / inscription Intune remont…",
        "Couleur du boîtier sans diagnostic préalable",
        "Nombre de photos iCloud sans diagnostic préalable",
        "Version de Jamf Pro sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'L’appareil devient une « signal » dans CA : conforme, hybride Azure AD join, etc., pour autoriser ou bloquer les sessions.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Un utilisateur BYOD accède à Outlook sans PIN applicatif malgré une politique App Protection assignée. Où investiguer ?',
      options: opt(
        "Politique MAM, groupe utilisateur, Company Portal, version Outlook supportée",
        "Réinstallation de BitLocker sur le poste de l’administrateur Intune",
        "Renouvellement du certificat Push Apple dans la console Jamf sans diagnostic préalable",
        "Désactivation du MFA Entra ID pour tout le tenant sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Les politiques App Protection s’appliquent par utilisateur et par application cible. Company Portal ou l’app elle-même doit refléter l’enregistrement MAM. Une version Outlook trop ancienne peut ignorer certaines contraintes PIN. BitLocker et certificat Jamf sont hors sujet pour MAM iOS. Désactiver MFA aggraverait le risque au lieu de corriger le conteneur applicatif.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle stratégie Conditional Access complète une politique App Protection pour Outlook sur iPhone BYOD ?',
      options: opt(
        "Exiger une app protégée par Intune ou un appareil conforme pour accéder à Exchang…",
        "Autoriser toutes les apps mail tierces sans condition sans diagnostic préalable",
        "Bloquer uniquement les connexions depuis la France sans diagnostic préalable",
        "Exiger un compte Apple ID géré par l’entreprise sur l’App Store sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Conditional Access peut imposer « exiger une application approuvée » ou « exiger un appareil marqué comme conforme ». Combiné à App Protection, seules les instances Outlook managées accèdent aux données M365. Sans CA, une app non managée pourrait encore synchroniser si les credentials fuient. Valider sur un iPhone pilote avec compte test avant déploiement global.',
    },

    {
      type: 'SCENARIO',
      prompt:
        'BYOD : Outlook accède au mail malgré politique App Protection PIN requise. Investigation Intune ?',
      options: opt(
        "Politique MAM, groupe utilisateur, app Outlook, version supportée, état M…",
        "Réinstaller BitLocker sur le poste de l’administrateur Intune",
        "Renouveler le certificat Push Apple dans la console Jamf sans diagnostic préalable",
        "Désactiver le MFA Entra ID pour tout le tenant sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'MAM s’applique par utilisateur Azure AD et app cible. Outlook iOS doit être version supportant Intune SDK. Company Portal peut afficher enrollment MAM status. CA « require app protection » bloque clients non managés — vérifiez sign-in logs 53003. Délai propagation 15-30 min possible. BitLocker et Jamf hors périmètre MAM iOS. Test compte pilote avant 200 utilisateurs BYOD.',
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Quelle combinaison sécurise Outlook/Teams sur iPhone COPE supervisé Intune (200 devices) ?',
      options: opt(
        "Conformité device + App Protection + CA exigeant appareil conforme ET/OU app p…",
        "Wi-Fi guest seul (option incorrecte pour ce cas)",
        "Désactivation Conditional Access pour exécutifs sans diagnostic préalable",
        "Compte Apple ID partagé entre tous les iPhone sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'COPE combine MDM complet (conformité, profils, supervision) et MAM pour defense-in-depth. CA enforce compliant device pour accès M365 ; MAM ajoute PIN app et bloc copie. Shared Apple ID viole bonnes pratiques. Exclusions CA créent failles audit. Pilote 10 devices valide copier-coller bloqué et accès Teams. Modèle standard entreprises finance/santé avec flotte Apple.',
    },
  ],
  'vpp-abm-business-apps': [
    {
      type: 'KNOWLEDGE',
      prompt: 'Quel token Apple distinct faut-il synchroniser dans Intune pour distribuer des apps VPP depuis ABM ?',
      options: opt(
        "Token VPP (Apps and Books), en plus du Push cert, du Enrollment Program Token",
        "Uniquement le certificat Push MDM suffit pour toutes les apps sans diagnostic préalable",
        "Token Exchange Online (option incorrecte pour ce cas)",
        "Clé BitLocker recovery (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Trois artefacts : Push (commandes MDM), ADE token (inventaire/enrollment), VPP token (licences apps). Ne pas les confondre.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Où assigner une app iOS store achetée via ABM en mode Required à 200 iPhone corporate ?',
      options: opt(
        "Intune → Apps → iOS app → Assignments → Required sur groupe dynamique iO…",
        "Apple ID personnel de chaque employé dans App Store sans diagnostic préalable",
        "Profil Wi-Fi uniquement (option incorrecte pour ce cas)",
        "Conditional Access sans app assignment sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Required pousse InstallApplication automatiquement aux appareils du groupe assigné.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quelle assignation licence VPP convient le mieux à des iPad partagés en classe ?',
      options: opt(
        'Device-based — licence liée à l’appareil',
        'User-based avec compte Gmail personnel',
        'Aucune licence VPP nécessaire',
        'Licence liée au numéro IMEI Android'
      ),
      correctOption: 'a',
      explanation:
        'Device-based évite dépendance compte utilisateur sur flottes partagées retail/éducation.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        '30 iPhone affichent Teams « Pending install » depuis 3 h sur le même site Wi-Fi. Première piste ?',
      options: opt(
        "Filtrage réseau/proxy vers CDN Apple ou check-in MDM st…",
        "Révoquer toutes licences M365 sans diagnostic préalable",
        "Changer le modèle iPhone sans diagnostic préalable",
        "Désactiver supervision ABM sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Pending prolongé sur périmètre homogène → infra réseau ou MDM push, pas panne unitaire.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Une app métier B2B privée doit être déployée sur iPhone supervisés. Flux correct ?',
      options: opt(
        "App accordée dans ABM → sync VPP Intune → assignation Required au grou…",
        "Email IPA non signé aux utilisateurs sans diagnostic préalable",
        "Installation via TestFlight public sans gouvernance sans diagnostic préalable",
        "SideLoad depuis site web inconnu sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Apps B2B passent par ABM/VPP/MDM ; IPA ad hoc non gouverné viole politique sécurité.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Où consulter le statut d’installation des apps iOS déployées par Intune ?',
      options: opt(
        "Apps → Monitor → App install status (par app",
        "Entra ID → Sign-in logs uniquement sans diagnostic préalable",
        "Apple Configurator sur Windows sans diagnostic préalable",
        "Jamf Pro Server Settings sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'App install status centralise Installed, Pending, Failed pour triage admin.',
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège : toute la flotte échoue à installer une app VPP depuis hier soir. Cause la plus probable ?',
      options: opt(
        "Token VPP expiré, app retirée du catalogue ABM ou certificat…",
        "Un seul iPhone a une coque incompatible sans diagnostic préalable",
        "Mode sombre iOS désactivé sans diagnostic préalable",
        "Mot de passe PIN trop long sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Échec synchronisé global → artefact infra (token, Push, catalogue), pas device isolé.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'App LOB iOS interne (.ipa) — prérequis avant assignation Required sur pilote ?',
      options: opt(
        "IPA signé entreprise, espace disque suffisant, iOS version compatible, profils rés…",
        "Jailbreak activé sur iPhone (option incorrecte pour ce cas)",
        "Compte Apple ID enfant (option incorrecte pour ce cas)",
        "Désinstallation Intune Company Portal obligatoire sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'LOB exige packaging signé et prérequis réseau ; tester sur pilote supervisé avant masse.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Différence entre app Required et Available dans Intune pour iOS ?',
      options: opt(
        "Required = push auto",
        "Available force wipe immédiat sans diagnostic préalable",
        "Required ne fonctionne que sur Mac sans diagnostic préalable",
        "Aucune différence (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Required standard flotte corporate identique ; Available pour apps optionnelles ou self-service.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Réception 200 iPhone ABM — checklist apps avant J-Day. Élément indispensable ?',
      options: opt(
        "Tokens Push + ADE + VPP valides, licences suffisantes, pilote 10 devices Installed…",
        "Apple ID personnel partagé pour toute l’entreprise sans diagnostic préalable",
        "Désactiver Conditional Access (option incorrecte pour ce cas)",
        "Retirer profil SCEP pour accélérer (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Runbook réception : triple token, licences VPP, pilote install status, réseau CDN Apple — évite 200 tickets Pending.',
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen MD-102 / Intune mobile : avant J-Day, 200 iPhone COPE doivent recevoir Teams Required + CA « appareil conforme ». Quel enchaînement valide le runbook Zero Trust ?',
      options: opt(
        "Tokens Push + ADE + VPP valides, conformité device testée sur pilote, app Required assignée, CA appliquée, insta…",
        "Assigner Teams Available uniquement et désactiver CA pour accélérer — piste peu adaptée au scénario",
        "Apple ID partagé pour télécharger Teams manuellement (option incorrecte pour ce cas)",
        "Retirer profil SCEP pour simplifier le réseau (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Les examens Microsoft Intune mobile valident la chaîne complète ABM → conformité → app Required → CA. Un pilote avec install status Installed et accès M365 bloqué si non conforme prouve le modèle COPE finance/santé — réponse type certification.',
      examOnly: true,
    },
    {
      type: 'TROUBLESHOOTING',
      prompt:
        'Piège examen Intune : 40 iPhone affichent « Pending install » Teams alors que le token VPP vient d’être renouvelé hier. Première action conforme ?',
      options: opt(
        "Confirmer sync token VPP dans Intune + ABM, licences disponibles, connectivité CDN Apple sur si…",
        "Wipe immédiat des 40 appareils (option incorrecte pour ce cas)",
        "Désinstaller Company Portal sur toute la flotte (option incorrecte pour ce cas)",
        "Basculer tous les iPhone en mode BYOD sans MAM (option incorrecte pour ce cas)"
      ),
      correctOption: 'a',
      explanation:
        'Pending groupé post-maintenance token = artefact sync ou réseau, pas panne device. La méthode certification Intune : valider triple token, licences, réseau, repush pilote avant action destructive. Wipe massif sans diagnostic viole les runbooks Zero Trust.',
      examOnly: true,
    },
    {
      type: 'SCENARIO',
      prompt:
        'Examen blanc Intune : comité audit demande preuve que 95 % des iPhone ont l’app métier Required. Indicateur le plus fiable ?',
      options: opt(
        "Rapport install status Intune (Installed vs Pending/Failed) sur gro…",
        "Nombre de tickets helpdesk ouverts sans diagnostic préalable",
        "Taille moyenne des photos iCloud sans diagnostic préalable",
        "Version Safari sur Mac admin sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Reporting conformité apps Intune s’appuie sur install status par assignation — métrique standard MD-102 et audits Zero Trust. Corréler avec conformité device et token VPP valide complète la preuve audit.',
      examOnly: true,
    },
    {
      type: 'KNOWLEDGE',
      prompt:
        'Examen blanc : quel triplet d’artefacts ABM doit être valide avant un déploiement VPP Required massif Intune ?',
      options: opt(
        "Push MDM + Enrollment Program Token + Token VPP (Ap…",
        "Uniquement certificat Push sans diagnostic préalable",
        "Licence Jamf Pro sans diagnostic préalable",
        "Compte Google Workspace seul sans diagnostic préalable"
      ),
      correctOption: 'a',
      explanation:
        'Intune mobile certification exige la maîtrise des trois tokens Apple : commandes MDM, inventaire ADE et licences VPP. Confondre l’un d’eux est un piège classique examen MD-102.',
      examOnly: true,
    },
  ],
};

export const QUESTIONS_BY_COURSE: Record<CourseSlug, Record<string, SeedQuestion[]>> = {
  'apple-cert-prep': appleCertPrepQuestions,
  'jamf-pro-foundations': jamfProFoundationsQuestions,
  'intune-ios-enrollment': intuneIosEnrollmentQuestions,
};

/** Pool complet seed (quiz module + bonus exam-only) pour examen blanc démo. */
export function getSeedQuestionsForCourse(courseSlug: CourseSlug): SeedQuestion[] {
  return Object.values(QUESTIONS_BY_COURSE[courseSlug] ?? {}).flat();
}
