export type QuizOption = { id: string; label: string };

export type SeedQuestion = {
  type: string;
  prompt: string;
  options: QuizOption[];
  correctOption: string;
  explanation: string;
};

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
        'Remplacer immédiatement la batterie en atelier',
        'Vérifier câble/chargeur certifié, laisser charger 15 min puis forcer le redémarrage',
        'Restaurer en DFU sans demander de sauvegarde',
        'Désactiver Find My depuis le Mac du technicien'
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
        'Confirmer l’existence d’une sauvegarde iCloud ou locale récente et chiffrée',
        'Désinstaller toutes les apps tierces',
        'Réinitialiser uniquement les réglages réseau',
        'Activer le mode développeur'
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
        'Remplacer le SSD sous garantie',
        'Libérer de l’espace disque et identifier les processus gourmands (Activité moniteur)',
        'Réinstaller macOS sans sauvegarde',
        'Désactiver FileVault pour « accélérer » le Mac'
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
        'Vérifier la procédure de retrait Activation Lock avec le propriétaire ou l’organisation (ABM/MDM)',
        'Contourner le verrouillage via un outil tiers',
        'Remplacer la carte mère sans documentation',
        'Effacer l’appareil depuis Réglages sans authentification'
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
        'Le redémarrage forcé suffit toujours avant toute restauration',
        'L’erreur 4013 indique souvent un problème USB/câble ou port ; vérifier câble certifié et port avant DFU/restauration',
        'Il faut immédiatement changer la batterie',
        '4013 signifie que Find My est désactivé — aucune action requise'
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
        'Numéro de série, version iOS, symptômes, étapes déjà tentées et résultat des tests non destructifs',
        'Uniquement la couleur de l’appareil',
        'Le mot de passe iCloud du client en clair',
        'La liste des apps TikTok installées'
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
        'Contacter l’équipe MDM pour vérifier certificat SCEP/PKI et renouvellement du profil de gestion',
        'Supprimer manuellement le profil MDM depuis Réglages Système',
        'Désactiver SIP pour forcer la confiance du certificat',
        'Réinstaller macOS sans consulter la console MDM'
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
        'Console MDM (inventaire appareil) et portail Apple Business Manager pour l’assignation serveur',
        'App Réglages > Safari > Historique',
        'Compte iCloud personnel de l’élève uniquement',
        'App Store > Achats de l’utilisateur'
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
        'Profils MDM non supprimables par l’utilisateur et restrictions avancées (App Store, comptes, AirDrop)',
        'Désactivation automatique d’Activation Lock sans ABM',
        'Installation d’apps Android via sideload',
        'Suppression du chiffrement hardware Secure Enclave'
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
        'Filtrage proxy/pare-feu bloquant les domaines CDN Apple (gsp.apple.com, appldnld.apple.com)',
        'FileVault désactivé sur les iPhone',
        'Expiration du certificat BitLocker',
        'Absence de compte Google Workspace'
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
        'Oublier le réseau, resaisir les identifiants 802.1X et vérifier date/heure automatiques',
        'Restaurer l’iPhone immédiatement',
        'Désactiver le chiffrement du disque',
        'Supprimer le profil MDM manuellement'
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
        'Combinaison de redémarrage forcé adaptée au modèle (boutons volume/side)',
        'Restauration DFU immédiate',
        'Réinitialisation « Effacer contenu et réglages »',
        'Retrait de la carte SIM uniquement'
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
        'Console (macOS) et/ou Apple Configurator pour l’inventaire et les journaux',
        'Time Machine uniquement',
        'Boot Camp Assistant',
        'Utilitaire de disque pour formater l’iPhone'
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
        'Proposer diagnostic batterie officiel et remplacement si capacité/cycles hors seuil',
        'Ignorer l’alerte si l’appareil s’allume encore',
        'Réinitialiser uniquement les réglages réseau',
        'Installer une app « calibrage batterie » du App Store'
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
        'Le MDM est désinstallé — aucune action',
        'Restriction réseau, proxy ou pare-feu bloquant les domaines Apple/MDM ; vérifier connectivité vers gsp/appldnld',
        'La batterie est à 100 % — normal',
        'Il faut jailbreaker pour débloquer les apps'
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
        'Dernière date de check-in, commandes en attente et état de supervision',
        'Uniquement la couleur de la coque',
        'Le compte iCloud personnel de l’élève',
        'La version de watchOS'
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
        'Vérifier validité du profil SCEP, chaîne CA et renouvellement du payload certificat dans la console MDM',
        'Réinitialiser le mot de passe Apple ID de l’utilisateur',
        'Désactiver le chiffrement FileVault sur le Mac admin',
        'Changer la langue du clavier iOS'
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
        'Certificat APNs MDM expiré ou mal importé — les appareils ne reçoivent plus les commandes Push',
        'Les utilisateurs ont tous désinstallé Safari',
        'La version iOS est identique sur tous les appareils',
        'Le mode basse consommation désactive uniquement le Wi-Fi personnel'
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
        'Dernière check-in récente et commandes MDM passant à Acknowledged/Completed',
        'Couleur de la coque déclarée par l’utilisateur',
        'Nombre de photos iCloud',
        'Version de watchOS associée'
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
        'Nouveau certificat avec topic APNs différent ou import incomplet — les appareils ne reconnaissent plus le serveur Push',
        'Les utilisateurs ont tous désactivé Bluetooth',
        'iOS 17 interdit désormais le MDM',
        'Le mode Focus « Ne pas déranger » bloque le MDM'
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
        'Tests clavier/trackpad, OS à jour, comptes temporaires retirés, confidentialité respectée',
        'Laisser le compte admin atelier actif pour « faciliter le SAV »',
        'Désactiver FileVault pour accélérer les prochains démarrages',
        'Installer un profil MDM personnel du technicien'
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
        'Isoler une défaillance matérielle probable avant ouverture du châssis',
        'Activer le mode développeur iOS',
        'Créer un compte Apple Business Manager',
        'Synchroniser les apps Jamf'
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
        'Sauvegarde iCloud ou locale chiffrée via Finder/iTunes',
        'Export VCF des contacts seulement',
        'Capture d’écran des réglages Wi-Fi',
        'AirDrop des photos uniquement'
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
        'Vérifier alimentation/câble, test batterie/SMC si applicable, puis Apple Diagnostics',
        'Remplacer la carte mère sans test',
        'Réinstaller macOS en premier',
        'Désactiver SIP avant toute mesure'
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
        'Il faut mémoriser tous les codes par cœur sans documentation',
        'Une démarche structurée (faits, tests non destructifs, documentation) prime sur le détail de chaque code',
        'Les codes Diagnostics ne servent jamais en SAV',
        'Seul le remplacement immédiat du SSD est accepté'
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
        'Travailler sur copie ou compte invité, ne pas exporter de données personnelles sans accord',
        'Copier le dossier Documents sur clé USB personnelle « pour analyse »',
        'Publier les logs sur un forum public',
        'Conserver le mot de passe session dans le ticket'
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
        'Coordonner avec l’admin MDM pour retrait ou wipe géré, puis validation fonctionnelle avant restitution',
        'Effacer le disque sans informer l’équipe MDM ni documenter le numéro de série',
        'Laisser le compte admin atelier permanent pour « faciliter le SAV futur »',
        'Installer un profil de test personnel du technicien'
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
        'ABM centralise achats et assignation MDM ; le technicien doit connaître supervision et Activation Lock',
        'ABM remplace entièrement les outils de diagnostic matériel Apple',
        'ABM sert uniquement à acheter des apps sur l’App Store grand public',
        'ABM n’a aucun rapport avec Find My ou Activation Lock'
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
        'Au redémarrage, Setup Assistant réenrôle automatiquement via Remote Management vers le MDM assigné',
        'L’appareil devient non supervisé définitivement sans action admin',
        'Activation Lock disparaît sans compte Apple',
        'Le MDM ne peut plus jamais gérer cet appareil'
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
        'Refuser : seules voies Apple documentées (identifiants propriétaire, ABM, commande MDM) sont acceptables',
        'Accepter si le client signe une décharge',
        'Remplacer la carte mère sans trace',
        'Utiliser un profil MDM personnel du technicien'
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
        'Acheter et distribuer des licences d’apps via ABM vers des appareils gérés sans Apple ID personnel',
        'Remplacer le serveur MDM pour installer des apps Android',
        'Désactiver l’App Store sur tous les Mac personnellement',
        'Contourner Activation Lock sur iPhone volés'
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
        'Restaurer immédiatement l’iPhone en DFU',
        'Vérifier Wi-Fi, profil MDM présent et dernière check-in avant escalade admin',
        'Supprimer le profil MDM depuis Réglages',
        'Créer un Apple ID personnel pour réinstaller l’app'
      ),
      correctOption: 'b',
      explanation:
        'Le triage non destructif vérifie connectivité, gestion MDM et synchronisation avant wipe ou suppression de profil — gestes risqués sur appareil supervisé.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Sur un iPhone supervisé via ADE, une app installée par le MDM est généralement :',
      options: opt(
        'Une app gérée que l’utilisateur ne peut pas retirer comme sur un appareil perso',
        'Toujours téléchargeable librement sans licence VPP',
        'Installable uniquement via iTunes sur Windows',
        'Exemptée de toute commande MDM'
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
        'Filtrage réseau ou proxy bloquant les téléchargements App Store/CDN Apple',
        'Teams n’existe pas sur l’App Store',
        'VPP est réservé aux Mac uniquement',
        'Le mode Focus Dodo empêche toute installation'
      ),
      correctOption: 'a',
      explanation:
        'Un blocage réseau local explique un échec groupé ; tester LTE ou un autre SSID isole la cause avant de suspecter licences ou matériel.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Qu’est-ce qu’une assignation de licence VPP « device-based » ?',
      options: opt(
        'La licence est liée à l’appareil, adaptée aux flottes partagées sans compte perso',
        'La licence est liée au numéro IMEI du technicien',
        'L’utilisateur doit saisir sa carte bancaire sur chaque iPhone',
        'Seul Apple Diagnostics peut activer la licence'
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
        'C’est attendu : le MDM repousse les apps au check-in une fois le Wi-Fi entreprise stable',
        'L’appareil est défectueux et doit être remplacé immédiatement',
        'VPP ne fonctionne qu’une seule fois à vie',
        'Il faut jailbreaker pour accélérer'
      ),
      correctOption: 'a',
      explanation:
        'Après setup ADE, InstallApplication s’exécute au fil des sync MDM ; patience + réseau valide avant panique ou second effacement.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quel élément le technicien L1 doit-il documenter avant d’escalader un ticket app VPP ?',
      options: opt(
        'Numéro de série, version iOS, nom app, tests réseau et état profil MDM',
        'Mot de passe iCloud en clair',
        'Liste des photos personnelles de l’utilisateur',
        'Numéro de carte SIM du technicien'
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
        'Problème catalogue ABM, licences épuisées ou token MDM — pas 200 pannes matérielles',
        '200 écrans cassés simultanément',
        'iOS interdit désormais Teams',
        'Chaque utilisateur a oublié son PIN en même temps'
      ),
      correctOption: 'a',
      explanation:
        'Un échec massif synchronisé pointe vers infrastructure (VPP, MDM, réseau global), pas vers panne unitaire.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Lors d’un départ employé, le wipe sélectif des apps gérées :',
      options: opt(
        'Efface les données pro des apps MDM tout en laissant l’appareil géré selon politique',
        'Supprime automatiquement le compte ABM de l’entreprise',
        'Désactive Find My sur tous les Mac du parc',
        'Installe des apps non approuvées'
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
        'Refuser : seules apps approuvées via VPP/MDM ou processus B2B interne sont autorisées',
        'Accepter si l’utilisateur est manager',
        'Installer via Finder sans trace',
        'Désactiver la supervision temporairement'
      ),
      correctOption: 'a',
      explanation:
        'Les apps sideload non gouvernées violent la sécurité entreprise et la supervision ; escalade vers admin MDM pour distribution légitime.',
    },
  ],
};

export const jamfProFoundationsQuestions: Record<string, SeedQuestion[]> = {
  'smart-groups-policies': [
    {
      type: 'KNOWLEDGE',
      prompt: 'À quoi sert principalement un Smart Group dans Jamf Pro ?',
      options: opt(
        'Créer un compte Apple ID consommateur',
        'Cibler dynamiquement des appareils selon des critères d’inventaire ou de conformité',
        'Remplacer le serveur APNs Apple',
        'Héberger les sauvegardes Time Machine centralisées'
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
        'Smart Group pilote + politique (policy) scoping le paquet ou le script d’installation',
        'Profil Wi-Fi iOS envoyé à tous les Mac',
        'Suppression de tous les Smart Groups existants',
        'Enrollment manuel utilisateur sans MDM'
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
        'Réappliquer scripts/paquets/profils tant que l’appareil reste dans le scope',
        'Remplacer Apple Business Manager',
        'Désactiver FileVault sur tout le parc',
        'Configurer uniquement les Apple Watch'
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
        'Jamf a un bug — Ventura n’existe pas',
        'Le critère « supérieur ou égal » inclut toutes les versions plus récentes que 10.13, dont Ventura',
        'Les Smart Groups ne filtrent jamais par OS',
        'Seuls les iPhone peuvent être dans un Smart Group Mac'
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
        'Consulter les logs de politique sur un Mac concerné, vérifier droits et dépendances, ajuster le script avant élargir le scope',
        'Passer immédiatement le scope à « Tous les ordinateurs »',
        'Révoquer le certificat Push',
        'Désinscrire les 3 Mac d’ABM'
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
        'Le statique est une liste fixe ; le Smart Group se met à jour selon critères',
        'Le Smart Group ne peut contenir que des iPhone',
        'Le groupe statique se met à jour seul chaque nuit',
        'Aucune différence en Jamf Pro'
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
        'Créer le profil Configuration SCEP + payload Wi-Fi, scope Smart Group pilote, vérifier certificat sur un Mac test',
        'Envoyer le profil Wi-Fi sans certificat à tous les ordinateurs immédiatement',
        'Demander à chaque utilisateur d’importer manuellement un .p12 par e-mail',
        'Désactiver FileVault avant tout déploiement SCEP'
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
        'Enrollment Complete s’exécute à l’inscription ; Ongoing se réapplique tant que l’appareil reste dans le scope',
        'Ongoing ne fonctionne que sur iPhone',
        'Enrollment Complete remplace Apple Business Manager',
        'Aucune différence — les deux triggers sont identiques'
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
        'GET /api/v1/computers-inventory avec paramètres section et filter OData-like',
        'POST /api/v1/delete-all-devices',
        'GET /api/v1/apple-push-cert/download-only',
        'PUT /api/v1/users/reset-password'
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
        'Vérifier licences VPP, assignation device-based, logs commande InstallApplication et réseau sur les 2 appareils',
        'Supprimer le Smart Group et tout envoyer à All Mobile Devices',
        'Révoquer le certificat Push',
        'Désactiver la supervision sur les 2 iPhone'
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
        'Fiche inventaire du Mac : extensions, politiques en échec, dernière check-in',
        'Console ABM uniquement',
        'App Réglages > Safari sur l’iPhone du même utilisateur',
        'Portail Microsoft 365'
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
        'L’appareil n’a plus d’enrôlement MDM actif ou a été retiré',
        'Le Mac est neuf dans ABM mais pas encore assigné',
        'FileVault est activé',
        'Le Mac est en mode Recovery'
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
        'Agent MDM d’abord (visibilité), puis OS, puis espace disque selon criticité métier',
        'Ignorer jusqu’à la prochaine audit annuelle',
        'Formater les trois Mac le même jour',
        'Désactiver toutes les politiques de conformité'
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
        'Scope de politique incorrect, fenêtre de maintenance, ou politique en échec précédent bloquant',
        'APNs toujours invalide si check-in récent',
        'Le Mac n’est pas allumé',
        'Jamf ne supporte pas les policies'
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
        'Statut FileVault / Personal Recovery Key dans la section Sécurité',
        'Couleur du boîtier',
        'Numéro de téléphone de l’utilisateur',
        'Version watchOS'
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
        'Recherche avancée ou Smart Group « Non conformes OS » + export CSV',
        'Supprimer les Mac non conformes du MDM',
        'Réinitialiser les mots de passe Apple ID',
        'Exporter uniquement les iPhone'
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
        'Délai d’inventaire : le statut FileVault n’a pas encore été remonté au prochain check-in MDM',
        'FileVault désactive automatiquement la gestion Jamf',
        'Les Smart Groups ne peuvent pas filtrer sur le chiffrement',
        'Jamf Pro ne remonte jamais l’état FileVault'
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
        'Check-in MDM ancienne (>48 h) combinée à absence de rapport inventaire récent',
        'Couleur du boîtier « Space Gray »',
        'Présence de Xcode installé',
        'FileVault activé avec clé de récupération escrowed'
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
        'Indicateur jailbreak / compromised dans section Security ou extension attribute dédié',
        'Couleur du boîtier dans Hardware',
        'Prénom de l’utilisateur dans General',
        'Version Xcode installée'
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
        'Échec ADE au Setup Assistant, mauvaise assignation serveur MDM dans ABM, ou PreStage non scoped',
        'Les Mac sont forcément volés',
        'FileVault empêche l’inventaire Jamf',
        'Jamf ne gère pas les Mac Apple Silicon'
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
        'Jeton serveur MDM Apple (MDM Server Token) valide dans Jamf Pro',
        'Compte iCloud @gmail.com partagé',
        'Profil Wi-Fi manuel sur chaque Mac',
        'Licence Microsoft 365 Business Basic'
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
        'Il permet au serveur d’envoyer les commandes MDM aux appareils gérés',
        'Il remplace le chiffrement FileVault',
        'Il installe automatiquement Xcode',
        'Il sert uniquement aux notifications mail Outlook'
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
        'Vérifier jeton MDM + APNs → assigner appareils au serveur Jamf dans ABM → activer un Mac test → valider PreStage/ADE',
        'Demander à chaque utilisateur d’installer Jamf Self Service depuis l’App Store sans ABM',
        'Activer les Mac hors ligne sans Wi-Fi',
        'Créer des comptes locaux admin « admin/admin »'
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
        'PreStage Enrollment / profil Automated Device Enrollment',
        'Politique de fond d’écran uniquement',
        'Extension Safari',
        'Compte réseau Open Directory'
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
        'Non — supervision et non-supervision ont les mêmes capacités MDM',
        'Oui — la supervision débloque des payloads et restrictions avancées (ex. pare-feu, certaines limites)',
        'Oui, mais uniquement sur Android',
        'Non — seul l’utilisateur peut tout configurer'
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
        'Renouveler le certificat APNs dans le portail Apple et l’importer dans Jamf avant expiration',
        'Attendre l’expiration puis réenrôler manuellement 500 Mac',
        'Désactiver le MDM sur tout le parc',
        'Changer uniquement le mot de passe admin Jamf'
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
        'Validité et upload du nouveau MDM Server Token dans Jamf + assignation appareils au serveur Jamf dans ABM',
        'Réinstallation de Jamf Admin sur le poste du technicien uniquement',
        'Changement du mot de passe Apple ID personnel',
        'Suppression de tous les PreStage existants'
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
        '30 à 45 jours — tester import avant date d’expiration effective',
        'La veille à minuit sans test',
        'Uniquement après coupure constatée sur 200 appareils',
        'Tous les 10 ans'
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
        'Upload nouveau MDM Server Token dans Jamf ET import dans ABM ; confirmer assignation appareils au serveur Jamf',
        'Réinstaller Jamf Admin sur poste technicien uniquement',
        'Changer mot de passe Apple ID personnel',
        'Supprimer tous les PreStage'
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
        'GET /api/v1/computers-inventory avec filtres sur osVersion et reportDate',
        'Classic API /JSSResource/users uniquement',
        'Endpoint Jamf Connect cloud sans lien inventaire',
        'Apple Configurator USB export'
      ),
      correctOption: 'a',
      explanation:
        'computers-inventory est l’API enrichie recommandée pour reporting et filtres ; Classic API reste legacy pour certains objets.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'À quoi sert un Extension Attribute (EA) calculé par script dans Jamf Pro ?',
      options: opt(
        'Enrichir l’inventaire avec une valeur custom pour Smart Groups et conformité',
        'Remplacer le certificat Push Apple',
        'Désactiver FileVault à distance sans MDM',
        'Convertir un iPhone en appareil Android'
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
        'Mac/iPhone lent, check-in MDM rallongé, utilisateurs se plaignent de lenteur',
        'Activation Lock déclenché automatiquement',
        'Smart Group vide systématiquement',
        'Certificat Push renouvelé seul'
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
        'Repush InstallApplication ou RefreshMobileDevice via API sur Smart Group concerné',
        'EraseDevice via API sur les 45 appareils immédiatement',
        'Supprimer le certificat Push Jamf',
        'Désinstaller Jamf Pro du serveur'
      ),
      correctOption: 'a',
      explanation:
        'Pending massif + cause réseau résolue → repush MDM ciblé, pas wipe. API permet bulk sur Smart Group après validation.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Quelle différence entre politique Jamf « Enrollment Complete » et « Ongoing » pour l’automation ?',
      options: opt(
        'Enrollment Complete = bootstrap initial ; Ongoing = maintenance récurrente et correction drift',
        'Ongoing ne s’exécute qu’une seule fois à vie',
        'Enrollment Complete remplace le certificat APNs',
        'Aucune différence en Jamf Cloud'
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
        'Pipeline CI avec approbation, compte API dédié, logs centralisés — interdire wipe ad hoc',
        'Partager le token OAuth dans un canal Teams public',
        'Utiliser compte admin personnel sans traçabilité',
        'Désactiver toute API Jamf'
      ),
      correctOption: 'a',
      explanation:
        'EraseDevice est destructif ; garde-fous workflow + compte service + audit trail sont obligatoires en enterprise.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Que faire face à une réponse HTTP 429 lors d’appels API Jamf Cloud en batch ?',
      options: opt(
        'Backoff exponentiel, pagination plus petite, étaler les requêtes',
        'Relancer immédiatement 10 000 requêtes par seconde',
        'Changer le topic certificat Push',
        'Effacer l’inventaire Jamf'
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
        'URL endpoint HTTPS accessible, certificat TLS valide, secret webhook et logs Jamf Pro',
        'Réinstallation Safari sur Mac admin',
        'Renouvellement token VPP ABM',
        'Changement mot de passe utilisateur final iPhone'
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
        'Script planifié OAuth → computers-inventory filtré → CSV/Power BI automatique',
        'Capture manuelle écran par écran dans Jamf Admin',
        'Demander à chaque utilisateur son numéro de version macOS par email',
        'Désactiver Smart Groups existants'
      ),
      correctOption: 'a',
      explanation:
        'Automation API standardise reporting, réduit erreur humaine et prépare audits récurrents sans effort manuel.',
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
        'Jeton serveur MDM Apple téléchargé depuis ABM et uploadé dans Intune',
        'Compte Gmail partagé par l’école',
        'Profil Wi-Fi créé à la main sur chaque iPad',
        'Licence Jamf Pro'
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
        'Imposer la supervision et personnaliser les étapes du Setup Assistant',
        'Installer des apps Android',
        'Remplacer Entra ID',
        'Désactiver le chiffrement BitLocker'
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
        'Appareils > iOS/iPadOS > Profils d’inscription > Profils d’inscription des appareils',
        'Applications > VPP uniquement',
        'Rapports > Audit des connexions Entra',
        'Endpoint security > Antivirus Mac'
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
        'Assignation des appareils au serveur MDM Intune dans ABM et validité du jeton MDM',
        'Réinstallation de Teams sur le PC admin',
        'Changement du fond d’écran',
        'Création d’un groupe de sécurité Exchange on-prem'
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
        'L’ADE rattache au MDM au Setup Assistant, mais une connexion réseau est requise pour télécharger profils et apps',
        'Aucun réseau n’est jamais nécessaire sur iOS',
        'L’ADE fonctionne uniquement sur macOS',
        'Il faut une carte SIM Android'
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
        'Le Setup Assistant applique le profil ADE et inscrit l’appareil dans Intune',
        'L’iPad reste non géré jusqu’à une inscription manuelle Company Portal obligatoire',
        'Seul le compte Apple ID personnel est créé',
        'Intune désinstalle automatiquement toutes les apps'
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
        'Dans le profil d’inscription des appareils ADE — paramètres Setup Assistant',
        'Dans une politique de conformité iOS uniquement',
        'Dans le portail Apple ID personnel de l’utilisateur',
        'Via une app Jamf Self Service'
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
        'Perte de synchronisation ABM et blocage des nouveaux enrôlements ADE',
        'Suppression automatique de tous les profils Wi-Fi iOS',
        'Désactivation du chiffrement BitLocker sur les PC',
        'Réinitialisation des mots de passe Entra ID'
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
        'Push cert autorise commandes MDM via APNs ; token ABM synchronise inventaire et ADE entre Apple et Intune',
        'Les deux fichiers sont identiques et interchangeables',
        'Token ABM remplace Conditional Access',
        'Push cert sert uniquement à BitLocker'
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
        'Connectivité réseau/DNS vers Apple et Microsoft, date/heure, validité certificat Push et token ABM',
        'Révoquer toutes licences M365',
        'Installer Jamf Pro en parallèle sans config',
        'Désactiver supervision dans ABM manuellement'
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
        'Évaluer PIN, version OS, jailbreak, etc., avant d’accorder l’accès aux ressources',
        'Remplacer Apple Business Manager',
        'Publier des apps sur l’App Store public',
        'Configurer un domaine DNS public'
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
        'Ouvrir le rapport de conformité Intune pour l’appareil et identifier la règle en échec',
        'Supprimer le tenant Entra ID',
        'Révoquer toutes les licences Microsoft 365',
        'Désactiver le Wi-Fi entreprise globalement'
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
        'Marquer non conforme, notification utilisateur, délai de grâce puis restriction via CA',
        'Effacer le tenant',
        'Désinscrire tous les appareils Android',
        'Ignorer car l’iPad est supervisé'
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
        'Appareil hors ligne, pas de check-in Intune, ou stratégie non assignée au bon groupe',
        'Le PIN est trop long',
        'L’utilisateur a trop de points sur le leaderboard',
        'Le certificat APNs Jamf a expiré'
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
        'Effacement sélectif ou complet (retrait) selon les paramètres de la politique',
        'Mise à jour automatique de macOS sur PC',
        'Création d’un compte admin local sur le Mac',
        'Installation de Chrome OS'
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
        'Identifier la règle OS en échec dans le rapport conformité, notifier l’utilisateur, planifier mise à jour iOS avant expiration du délai de grâce',
        'Supprimer immédiatement le compte Entra ID de l’utilisateur',
        'Désactiver toutes les politiques de conformité du tenant',
        'Révoquer le certificat APNs Jamf (hors périmètre Intune)'
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
        'La conformité Intune alimente le signal « appareil conforme » utilisé par les stratégies CA',
        'Conditional Access remplace entièrement les politiques de conformité',
        'Les deux sont indépendants et ne partagent aucun état',
        'Conditional Access ne s’applique qu’aux appareils Android'
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
        'Marquer non conforme immédiatement, bloquer CA M365, ticket sécurité, envisager wipe selon politique',
        'Attendre 30 jours de grace period standard OS',
        'Ignorer car l’utilisateur est direction',
        'Désactiver toutes politiques conformité du tenant'
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
        'Retire / Remote wipe (full wipe) configuré après délais progressifs',
        'Uniquement changement fond d’écran',
        'Réinitialisation mot de passe Entra automatique',
        'Installation Chrome OS Flex'
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
        'MAM protège les données dans les apps M365 sans contrôle total de l’appareil',
        'MAM remplace le certificat Push Apple',
        'MAM ne s’applique qu’aux PC Windows',
        'MAM empêche toute connexion Internet'
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
        'Politique App Protection iOS + Conditional Access « apps approuvées / exiger appareil conforme »',
        'Profil Wi-Fi guest uniquement',
        'Désactiver MFA',
        'Partager le mot de passe service dans Teams'
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
        'Transfert de données restreint (Restrict cut/copy/paste between apps)',
        'Mode avion obligatoire',
        'Rotation d’écran forcée',
        'Désactivation du Bluetooth'
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
        'Politique App Protection non assignée au utilisateur/app ou client Outlook non supporté',
        'Le Wi-Fi 6 est trop rapide',
        'L’iPhone est supervisé',
        'Le certificat APNs est renouvelé'
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
        'État de conformité / inscription Intune remonté dans Entra',
        'Couleur du boîtier',
        'Nombre de photos iCloud',
        'Version de Jamf Pro'
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
        'Assignation de la politique MAM au bon groupe utilisateur, état d’enregistrement Intune MAM dans Company Portal, version Outlook supportée',
        'Réinstallation de BitLocker sur le PC de l’admin',
        'Changement du certificat Push Apple dans Jamf',
        'Désactivation du MFA Entra ID globalement'
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
        'Exiger une app protégée par Intune ou un appareil conforme pour accéder à Exchange Online',
        'Autoriser toutes les apps mail tierces sans condition',
        'Bloquer uniquement les connexions depuis la France',
        'Exiger un compte Apple ID géré par l’entreprise sur l’App Store'
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
        'Assignation politique MAM au bon groupe utilisateur, app cible Outlook, version app supportée, état enrollment MAM',
        'Réinstaller BitLocker sur PC admin',
        'Renouveler certificat Push Jamf',
        'Désactiver MFA globalement'
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
        'Conformité device + App Protection + CA exigeant appareil conforme ET/OU app protégée selon modèle',
        'Wi-Fi guest seul',
        'Désactivation Conditional Access pour exécutifs',
        'Compte Apple ID partagé entre tous les iPhone'
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
        'Token VPP (Apps and Books) — en plus du Push cert et du Enrollment Program Token',
        'Uniquement le certificat Push MDM suffit pour toutes les apps',
        'Token Exchange Online',
        'Clé BitLocker recovery'
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
        'Intune → Apps → iOS app → Assignments → Required sur groupe dynamique iOS corporate',
        'Apple ID personnel de chaque employé dans App Store',
        'Profil Wi-Fi uniquement',
        'Conditional Access sans app assignment'
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
        'Filtrage réseau/proxy vers CDN Apple ou check-in MDM stale — avant wipe',
        'Révoquer toutes licences M365',
        'Changer le modèle iPhone',
        'Désactiver supervision ABM'
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
        'App accordée dans ABM → sync VPP Intune → assignation Required au groupe cible',
        'Email IPA non signé aux utilisateurs',
        'Installation via TestFlight public sans gouvernance',
        'SideLoad depuis site web inconnu'
      ),
      correctOption: 'a',
      explanation:
        'Apps B2B passent par ABM/VPP/MDM ; IPA ad hoc non gouverné viole politique sécurité.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Où consulter le statut d’installation des apps iOS déployées par Intune ?',
      options: opt(
        'Apps → Monitor → App install status (par app et par appareil)',
        'Entra ID → Sign-in logs uniquement',
        'Apple Configurator sur Windows',
        'Jamf Pro Server Settings'
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
        'Token VPP expiré, app retirée du catalogue ABM ou certificat Push expiré',
        'Un seul iPhone a une coque incompatible',
        'Mode sombre iOS désactivé',
        'Mot de passe PIN trop long'
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
        'IPA signé entreprise, espace disque suffisant, iOS version compatible, profils réseau/SCEP si app interne',
        'Jailbreak activé sur iPhone',
        'Compte Apple ID enfant',
        'Désinstallation Intune Company Portal obligatoire'
      ),
      correctOption: 'a',
      explanation:
        'LOB exige packaging signé et prérequis réseau ; tester sur pilote supervisé avant masse.',
    },
    {
      type: 'KNOWLEDGE',
      prompt: 'Différence entre app Required et Available dans Intune pour iOS ?',
      options: opt(
        'Required = push auto ; Available = install manuelle via Company Portal / portail apps',
        'Available force wipe immédiat',
        'Required ne fonctionne que sur Mac',
        'Aucune différence'
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
        'Tokens Push + ADE + VPP valides, licences suffisantes, pilote 10 devices Installed, flux réseau Apple OK',
        'Apple ID personnel partagé pour toute l’entreprise',
        'Désactiver Conditional Access',
        'Retirer profil SCEP pour accélérer'
      ),
      correctOption: 'a',
      explanation:
        'Runbook réception : triple token, licences VPP, pilote install status, réseau CDN Apple — évite 200 tickets Pending.',
    },
  ],
};
