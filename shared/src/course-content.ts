import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
} from './quiz-content';

export type ModulePedagogy = {
  summary: string;
  learningObjectives: string[];
  keyTakeaways: string[];
  lessonContent: string;
  gameInstructions?: string;
};

export type CoursePedagogy = {
  description: string;
  modules: Record<string, ModulePedagogy>;
};

export const COURSE_PEDAGOGY: Record<string, CoursePedagogy> = {
  'apple-cert-prep': {
    description: `Ce parcours s'adresse aux techniciens support de premier et second niveau, aux responsables de parc Apple en entreprise ou en établissement scolaire, et à toute personne qui souhaite poser des bases solides avant une certification Apple Device Support. L'objectif est de maîtriser une méthode de diagnostic structurée sur Mac, iPhone et iPad, de sécuriser les opérations de sauvegarde et de restauration, et de comprendre comment le support terrain dialogue avec un futur déploiement MDM via Apple Business Manager.

Vous apprendrez à identifier les symptômes matériels et logiciels les plus fréquents, à documenter vos interventions selon les bonnes pratiques atelier, et à éviter les gestes destructifs prématurés. Le contenu relie explicitement Activation Lock, supervision MDM et procédures SAV conformes aux recommandations Apple.

Prérequis : familiarité de base avec macOS et iOS/iPadOS, accès à un Mac de diagnostic et à quelques appareils de test. Aucune expérience MDM préalable n'est exigée, mais une connaissance des profils de configuration et de l'enrôlement automatisé (ADE) sera un atout pour la dernière partie du parcours.`,
    modules: {
      'device-support-basics': {
        summary:
          'Maîtriser le triage matériel/logiciel sur Mac et iOS, sécuriser sauvegardes et restaurations, et relier support terrain et gestion MDM.',
        learningObjectives: [
          'Appliquer une séquence de diagnostic non destructive avant toute restauration ou ouverture matérielle.',
          'Vérifier l’existence de sauvegardes chiffrées et documenter numéro de série, version OS et étapes déjà tentées.',
          'Comprendre Activation Lock, Find My et les voies légitimes de retrait via ABM ou console MDM.',
          'Relier un appareil supervisé à son profil MDM et interpréter les informations d’inventaire de base.',
        ],
        keyTakeaways: [
          'Toujours éliminer alimentation, espace disque et redémarrage forcé avant les gestes destructifs.',
          'Une restauration sans sauvegarde récente est irréversible pour les données utilisateur.',
          'Activation Lock ne se contourne pas : le retrait passe par le propriétaire, ABM ou le MDM.',
          'La traçabilité SAV repose sur l’identification précise de l’appareil et le journal des actions.',
        ],
        lessonContent: `## Fondamentaux du support Apple en contexte entreprise

Le support Device Support Apple repose sur une méthode progressive : observer, documenter, tester des actions réversibles, puis seulement envisager restauration ou réparation matérielle. En environnement géré, chaque intervention doit aussi tenir compte de la supervision MDM, des profils déployés et des contraintes de sécurité imposées par l’organisation.

### Diagnostic structuré sur Mac

Commencez par recueillir le numéro de série, la version macOS et les symptômes exacts. Sur un Mac lent ou bloqué, vérifiez l’espace disque disponible : un volume quasi plein provoque un swap excessif et des ralentissements majeurs. Utilisez **Moniteur d’activité** pour repérer les processus gourmands. Le mode sans échec permet d’isoler une extension ou un logiciel tiers responsable d’un écran de chargement infini après mise à jour.

Avant toute réinstallation de macOS, confirmez l’existence d’une sauvegarde Time Machine ou d’une sauvegarde manuelle des données critiques. Apple recommande de conserver les données utilisateur lors d’une réinstallation depuis la Recovery si l’objectif est de corriger le système sans effacement. Documentez chaque étape dans le ticket : symptômes, tests effectués, codes d’erreur Apple Diagnostics le cas échéant.

Référence : [Guide de dépannage macOS](https://support.apple.com/fr-fr/102664)

### iPhone et iPad : triage non destructif

Sur un iPhone qui ne s’allume plus, vérifiez d’abord câble et chargeur certifiés, laissez charger quinze minutes, puis tentez un redémarrage forcé adapté au modèle. Ce geste interrompt les processus figés sans effacer les données. La restauration DFU ou l’effacement complet ne viennent qu’après échec des étapes simples et validation de la sauvegarde.

Avant toute restauration iOS, la vérification la plus critique est l’existence d’une sauvegarde iCloud ou locale récente et chiffrée. Sans elle, applications, données santé et paires de clés ne pourront pas être restaurées. Pour les appareils d’entreprise supervisés, vérifiez également dans la console MDM la dernière synchronisation et la présence du profil de gestion.

### Activation Lock et continuité MDM

Find My et Activation Lock protègent l’appareil contre le vol. Un technicien ne doit jamais tenter de contourner ce verrouillage. Le retrait légitime passe par le compte propriétaire, le portail [Apple Business Manager](https://support.apple.com/fr-fr/102571) ou une commande MDM si l’appareil est inscrit et supervisé. En SAV, notez l’état du verrouillage avant toute réinitialisation.

### Profils, supervision et ABM

Un appareil **supervisé** via Automated Device Enrollment (ADE) accepte des restrictions et des profils que l’utilisateur ne peut pas retirer. Les profils de configuration définissent Wi-Fi, certificats, restrictions et paramètres de sécurité. Même en support de premier niveau, sachez identifier si l’appareil est géré : Réglages → Général → Gestion des appareils et VPN sur iOS, ou profils système sur macOS.

Apple Business Manager centralise l’achat d’appareils et leur affectation au serveur MDM. Comprendre ce lien aide à expliquer pourquoi certains réglages sont verrouillés et pourquoi une restauration locale peut nécessiter un réenrôlement via l’assistant de configuration.

### Documentation et bonnes pratiques atelier

Chaque ticket doit contenir : numéro de série, version du système, description précise des symptômes, étapes déjà tentées et résultat des tests non destructifs. Ne stockez jamais les mots de passe iCloud ou codes de déverrouillage en clair. Pour les erreurs de restauration (4013, 4014), vérifiez câble certifié, port USB et stabilité de la connexion avant de conclure à une panne matérielle.

En résumé, le technicien Device Support efficace combine rigueur diagnostic, respect des données utilisateur et conscience du cadre MDM dans lequel évolue l’appareil.`,
        gameInstructions:
          'Ordonnez les étapes de dépannage d’un Mac bloqué au démarrage pour appliquer la logique « vérifier l’espace disque, puis mode sans échec, puis réinstallation conservatoire ».',
      },
      'ios-troubleshooting': {
        summary:
          'Diagnostiquer connectivité, batterie et blocages courants sur iPhone/iPad avec une méthode reproductible, en tenant compte des profils d’entreprise et du MDM.',
        learningObjectives: [
          'Résoudre les échecs Wi-Fi 802.1X et vérifier date/heure, certificats et identifiants réseau.',
          'Utiliser redémarrage forcé, mode récupération et outils Apple Configurator sans effacer prématurément.',
          'Analyser check-in MDM, profils et journaux sur appareils supervisés connectés à un Mac.',
          'Prioriser les causes logicielles courantes avant une restauration complète.',
        ],
        keyTakeaways: [
          'Oublier le réseau et resaisir les identifiants règle la majorité des échecs Wi-Fi d’entreprise.',
          'La date et l’heure incorrectes cassent l’authentification certificats et 802.1X.',
          'Le profil MDM ne doit pas être supprimé manuellement sur un appareil supervisé.',
          'Console macOS et Apple Configurator complètent le triage sur appareils connectés.',
        ],
        lessonContent: `## Dépannage iOS et iPadOS en environnement géré

Les incidents iPhone et iPad en entreprise combinent souvent des causes réseau, des profils obsolètes et des états MDM désynchronisés. Une méthode structurée évite les restaurations inutiles et préserve la conformité du parc.

### Connectivité Wi-Fi et réseaux d’entreprise

Lorsqu’un iPhone ne joint plus le Wi-Fi 802.1X après un changement de mot de passe Active Directory, commencez par oublier le réseau concerné dans Réglages → Wi-Fi, puis resaisissez les identifiants. Les profils Wi-Fi déployés par MDM peuvent conserver d’anciennes informations ; une resynchronisation du profil depuis la console MDM est parfois nécessaire.

Vérifiez impérativement que **date et heure** sont réglées automatiquement. Un décalage horaire invalide les certificats et provoque des échecs d’authentification silencieux. Pour les réseaux avec certificat client, confirmez la validité du profil SCEP ou du certificat déployé via le profil de configuration.

Documentation : [Résoudre les problèmes Wi-Fi sur iPhone](https://support.apple.com/fr-fr/102654)

### Blocages système et redémarrage forcé

Un iPhone figé sur l’écran Apple peut souvent être débloqué par un redémarrage forcé adapté au modèle (combinaison volume + bouton latéral). Ce geste préserve les données utilisateur. Réservez la restauration DFU ou l’effacement aux cas où le blocage persiste après les tests simples et après confirmation de la sauvegarde.

Le mode récupération (écran iTunes/Finder) indique un problème plus profond. Les erreurs 401x lors d’une restauration pointent fréquemment vers un câble non certifié ou un port USB instable. Changez de câble et de port avant de conclure à une panne matérielle.

### Batterie, autonomie et performance

Une batterie dégradée provoque arrêts inopinés et ralentissements si iOS limite les performances. Consultez Réglages → Batterie → État de la batterie. En parc MDM, certaines politiques imposent un seuil minimal de santé batterie ; un appareil non conforme peut être signalé dans la console de gestion.

Identifiez les applications en arrière-plan consommatrices via Réglages → Batterie. Un profil restrictif peut limiter la localisation ou la synchronisation en arrière-plan ; croisez ces informations avec les politiques déployées avant de réinitialiser l’appareil.

### MDM : check-in, profils et synchronisation

Lorsqu’un iPad « ne synchronise plus les apps MDM », vérifiez dans l’ordre : connectivité Internet (Wi-Fi ou cellulaire), date/heure correctes, présence du profil MDM dans Réglages → Général → Gestion des appareils, puis dernière heure de check-in dans la console MDM (Jamf Pro, Intune ou autre).

Ne supprimez jamais manuellement le profil de gestion sur un appareil supervisé : cela casse la conformité et peut déclencher Activation Lock ou une réinitialisation factory selon la politique ADE. Préférez une commande de synchronisation forcée, la réinstallation du profil ou, en dernier recours, une réinitialisation supervisée via l’assistant de configuration.

### Outils de diagnostic avancés

Pour un iPhone supervisé connecté à un Mac, **Console** (macOS) permet d’analyser les journaux système filtrés par processus ou par sous-système. **Apple Configurator** offre une vue inventaire, la possibilité de superviser ou d’actualiser l’appareil, et des actions de dépannage adaptées aux flottes éducatives ou corporate.

Les journaux MDM côté serveur complètent le triage : statut des commandes en attente, échecs de installation d’apps VPP ou de profils, conflits entre profils Wi-Fi et VPN.

### Méthode de triage recommandée

1. Confirmer connectivité et heure système.
2. Vérifier profil MDM et dernière check-in.
3. Tester redémarrage forcé ou resynchronisation MDM.
4. Analyser journaux locaux si le problème persiste.
5. Envisager restauration supervisée uniquement après sauvegarde validée.

Cette séquence respecte les contraintes de sécurité tout en minimisant l’impact utilisateur.`,
        gameInstructions:
          'Classez les vérifications à effectuer sur un iPad qui ne synchronise plus le MDM, de la connectivité locale jusqu’à la resynchronisation serveur.',
      },
      'acmt-exam-prep': {
        summary:
          'Consolider les domaines clés Apple Device Support : sécurité, sauvegarde, restauration, diagnostics matériels et préparation méthodique à l’examen.',
        learningObjectives: [
          'Maîtriser la séquence Apple Diagnostics et interpréter les codes erreur avant toute réparation.',
          'Appliquer les bonnes pratiques de sauvegarde chiffrée et de restauration sur Mac et iOS.',
          'Identifier les gestes interdits ou non conformes en atelier (contournement Activation Lock, ouverture sans ESD).',
          'Structurer un runbook de diagnostic conforme aux attentes certification Device Support.',
        ],
        keyTakeaways: [
          'Apple Diagnostics précède le remplacement de composants : documentez les codes.',
          'FileVault et sauvegarde chiffrée iOS protègent les données mais imposent des prérequis de restauration.',
          'L’alimentation et les périphériques externes sont vérifiés avant toute conclusion matérielle.',
          'Un runbook atelier trace alimentation → diagnostics → documentation → réparation.',
        ],
        lessonContent: `## Préparation à l’examen Apple Device Support

La certification Apple Device Support valide votre capacité à diagnostiquer, documenter et réparer conformément aux procédures officielles. Ce module synthétise les domaines récurrents de l’examen et les relie aux réalités MDM et ABM rencontrées en entreprise.

### Sécurité et protection des données

FileVault chiffre le volume de démarrage sur Mac ; toute réparation ou réinstallation doit tenir compte de la clé de récupération ou du compte iCloud associé. Sur iOS, une sauvegarde chiffrée est obligatoire pour restaurer les données santé, mots de passe enregistrés et contenu HomeKit. L’examen teste votre capacité à expliquer ces prérequis au client avant toute action destructive.

Activation Lock et Find My restent des thèmes centraux : vous devez connaître les voies légitimes de retrait (identifiants propriétaire, déverrouillage organisationnel via ABM, commande MDM) et refuser tout contournement non documenté.

Référence : [Utiliser la restauration et la mise à jour iOS](https://support.apple.com/fr-fr/102664)

### Apple Diagnostics et diagnostic matériel

Sur Mac Intel ou Apple Silicon, Apple Diagnostics (ou Apple Diagnostics sur le web pour certains modèles récents) teste composants mémoire, stockage, batterie et capteurs. Lancez-le en maintenant la touche D au démarrage ou via le flux indiqué pour votre architecture. Notez les codes de référence affichés : ils orientent la commande de pièces et la décision réparation sous garantie ou hors garantie.

Avant Apple Diagnostics, vérifiez alimentation secteur, câbles d’origine et débranchez périphériques non essentiels. Un Mac qui ne s’allume pas après une panne électrique exige cette vérification en première étape — l’examen pénalise les sauts de logique.

### Sauvegarde, restauration et récupération

Maîtrisez les différences entre : redémarrage forcé, mode sans échec, Recovery, DFU (iOS), réinstallation macOS avec conservation des données, et effacement complet. Chaque niveau augmente l’impact sur les données. Le candidat doit justifier pourquoi il choisit un niveau donné selon les symptômes.

Time Machine, sauvegarde iCloud et sauvegarde locale chiffrée via Finder sont les trois piliers de continuité. En contexte MDM, une réinitialisation supervisée via ADE peut reprovisionner automatiquement l’appareil ; ce comportement diffère d’une restauration consumer.

### Runbook atelier type

Pour un Mac ne démarrant plus :

1. Vérifier alimentation, adaptateur et prise secteur.
2. Débrancher accessoires USB/Thunderbolt non indispensables.
3. Lancer Apple Diagnostics et consigner codes erreur.
4. Documenter résultats dans le système de tickets avant réparation matérielle.
5. Si logiciel suspecté, tenter Recovery avec réinstallation conservatoire.

Ce runbook illustre la pensée « preuve avant pièce » exigée à l’examen ACMT / Device Support.

### Lien avec MDM et flottes supervisées

Les techniciens certifiés interviennent de plus en plus sur des parc supervisés. Sachez expliquer comment un profil MDM survive ou non à une restauration, comment ABM assigne un appareil au serveur MDM, et pourquoi le support de premier niveau doit remonter à l’administrateur MDM avant de retirer des profils ou de réinitialiser un appareil inscrit.

Les certificats Push MDM, la supervision et les restrictions de l’assistant de configuration sont des notions adjacentes utiles à l’oral ou aux scénarios situés.

### Préparation active à l’examen

Entraînez-vous sur des scénarios chronométrés : symptôme → hypothèses → tests → conclusion. Relisez les guides officiels Apple Support, pratiquez sur un Mac et un iPhone de labo, et mémorisez les combinaisons de touches par famille de produits. Évitez les « raccourcis » appris sur des forums non officiels : l’examen valorise la conformité procédurale.

En consolidant sécurité, diagnostics, restauration et documentation, vous alignez votre pratique quotidienne sur le référentiel Apple Device Support tout en restant crédible face à un administrateur MDM ou un responsable de parc.`,
        gameInstructions:
          'Remettez dans l’ordre les étapes de diagnostic d’un Mac hors tension après une panne électrique, conformément au runbook atelier.',
      },
    },
  },
  'jamf-pro-foundations': {
    description: `Ce parcours cible les administrateurs système, les techniciens MDM confirmés et les responsables de parc Mac/iOS/iPadOS qui déploient ou administrent Jamf Pro au quotidien. Vous apprendrez à construire des Smart Groups pertinents, à piloter des politiques de configuration et de déploiement logiciel, à lire l’inventaire Jamf et à connecter votre instance à Apple Business Manager pour un enrôlement automatisé supervisé.

L’approche est pratique : chaque module s’appuie sur des scénarios réalistes (déploiement pilote, triage conformité, réception de matériel neuf) et sur les objets centraux de Jamf Pro — profils, extension attributes, politiques récurrentes, certificat Push et intégration ADE.

Prérequis : notions de gestion macOS/iOS, accès à une instance Jamf Pro (Cloud ou On-Prem) de labo, compte Apple Business Manager ou School Manager de test, et compréhension élémentaire des certificats et du protocole MDM Apple. Une expérience préalable avec des profils .mobileconfig est recommandée.`,
    modules: {
      'smart-groups-policies': {
        summary:
          'Construire des Smart Groups dynamiques et associer des politiques Jamf Pro pour cibler finement Mac, iPhone ou iPad en déploiement pilote.',
        learningObjectives: [
          'Créer des Smart Groups basés sur critères inventaire, version OS, applications ou extension attributes.',
          'Associer profils de configuration et politiques récurrentes à un périmètre pilote avant généralisation.',
          'Comprendre l’ordre d’exécution et le scope des politiques Jamf (Self Service, récurrence, limitations).',
          'Éviter les conflits de scope entre politiques et groupes statiques hérités.',
        ],
        keyTakeaways: [
          'Un Smart Group pilote limite le blast radius avant déploiement massif.',
          'Profils = état désiré ; politiques récurrentes = actions et scripts périodiques.',
          'Tester sur un Mac membre du Smart Group avant d’élargir le scope.',
          'Documenter critères et membership pour faciliter l’audit et le rollback.',
        ],
        lessonContent: `## Smart Groups et politiques Jamf Pro

Jamf Pro distingue **groupes statiques** (membership manuelle) et **Smart Groups** (membership dynamique selon critères). En production, les Smart Groups sont le mécanisme principal pour cibler des politiques MDM, des profils et des scripts sans maintenance manuelle de listes.

### Anatomie d’un Smart Group

Un Smart Group combine des critères avec des opérateurs logiques : version macOS supérieure à 14, application installée, extension attribute renseigné, appartenance à un site Jamf, type d’appareil (Mac, iOS, tvOS). Les extension attributes (EA) enrichissent l’inventaire via scripts locaux ou saisie API — par exemple département, niveau de patch ou statut FileVault.

Créez un Smart Group **pilote** avant tout déploiement massif : cinq à dix Mac représentatifs des configurations métier (Intel vs Apple Silicon, langue, apps critiques). Limitez la politique à ce groupe, validez le comportement, puis dupliquez la politique en élargissant progressivement le scope.

Documentation : [Smart Groups Jamf Pro](https://learn.jamf.com/bundle/jamf-pro-documentation/page/Smart_Groups.html)

### Profils vs politiques

Les **profils de configuration** (.mobileconfig) décrivent l’état désiré : Wi-Fi 802.1X, certificats SCEP, restrictions, VPN, calendriers, payloads PKI. Une fois déployés, le MDM ré applique le profil si l’utilisateur tente de le retirer (sur appareil supervisé).

Les **politiques** Jamf Pro déclenchent actions : installation de paquets (.pkg), scripts, montée de partages, maintenance cron-like via récurrence. Une politique peut cibler un Smart Group et exiger confirmation Self Service pour les déploiements sensibles.

Ne confondez pas « associer un profil via une politique » et « déployer un paquet » : les profils persistent ; les scripts d’installation s’exécutent à intervalle ou au check-in.

### Déploiement pilote d’un paquet logiciel

Scénario type : déployer un agent de sécurité ou une mise à jour interne.

1. Vérifier que le paquet est importé dans Jamf Admin ou uploadé via l’API.
2. Créer ou valider le Smart Group pilote (OS compatible, architecture correcte).
3. Créer une politique associant le paquet, scope = Smart Group pilote, exécution au prochain check-in.
4. Sur un Mac pilote : forcer une politique (commande \`sudo jamf policy\`) ou attendre le check-in.
5. Contrôler logs (/var/log/jamf.log), version installée et régression métier.
6. Élargir le scope par vagues (10 %, 50 %, 100 %).

### SCEP, certificats et profils réseau

Les environnements d’entreprise combinent souvent profils Wi-Fi 802.1X et certificats délivrés via **SCEP** (Simple Certificate Enrollment Protocol). Le profil SCEP référence une URL de challenge et un modèle PKI ; le payload Wi-Fi consomme le certificat identité. Testez le renouvellement certificat sur le Smart Group pilote avant déploiement global — un certificat expiré casse l’accès réseau entier du groupe.

### Bonnes pratiques de gouvernance

Nommez Smart Groups et politiques avec un préfixe site ou projet. Documentez les critères dans Confluence ou Git. Désactivez les politiques obsolètes plutôt que de multiplier les scopes contradictoires. Utilisez les groupes d’exclusion pour retirer les VIP ou machines de labo des déploiements agressifs.

### Self Service et expérience utilisateur

Jamf Self Service permet aux utilisateurs d’installer des apps ou lancer des politiques approuvées sans ticket helpdesk. Associez les politiques sensibles à une catégorie Self Service pour réduire la charge support tout en conservant un scope Smart Group strict côté serveur. Sur iOS supervisé, les apps VPP déployées via politique apparaissent dans Self Service si configuré.

En maîtrisant Smart Groups et politiques, vous industrialisez le déploiement MDM Jamf tout en gardant un contrôle fin sur les risques opérationnels.`,
        gameInstructions:
          'Ordonnez les étapes de déploiement d’un paquet sur un groupe pilote : Smart Group, politique, test, puis extension du scope.',
      },
      'inventory-basics': {
        summary:
          'Exploiter l’inventaire Jamf Pro, interpréter conformité et extension attributes pour prioriser les actions sur appareils hors norme.',
        learningObjectives: [
          'Naviguer inventaire général, fiches appareil et recherche avancée Jamf Pro.',
          'Interpréter statuts MDM, dernière check-in, version OS et espace disque.',
          'Utiliser extension attributes et Smart Groups de conformité pour détecter les écarts.',
          'Prioriser remédiation : agent MDM absent, OS obsolète, stockage saturé.',
        ],
        keyTakeaways: [
          'Une check-in récente confirme que la commande MDM peut atteindre l’appareil.',
          'L’OS obsolète est un risque sécurité : corréler avec politiques de mise à jour.',
          'Le disque plein empêche installations et caches de profils.',
          'L’inventaire alimente tickets et politiques correctives, pas seulement le reporting.',
        ],
        lessonContent: `## Inventaire et conformité Jamf Pro

L’inventaire Jamf Pro est la source de vérité opérationnelle du parc : modèle, numéro de série, utilisateur assigné, version macOS/iOS, applications, profils, extension attributes et historique des commandes MDM. Savoir lire et filtrer cet inventaire distingue un administrateur réactif d’un administrateur proactive.

### Navigation et fiche appareil

Depuis **Computers** ou **Mobile Devices**, la recherche rapide accepte nom, utilisateur, numéro de série ou adresse MAC. La fiche appareil regroupe :

- **General** : dernière check-in, IP, gestion MDM (Managed/Unmanaged).
- **Hardware** : stockage, batterie, processeur.
- **Software** : applications installées, version OS, mises à jour en attente.
- **Configuration Profiles** : profils déployés et statut (Applied/Pending/Failed).
- **Extension Attributes** : données custom remontées par scripts.

Une check-in antérieure de plus de 48 heures sur un appareil censé être actif signale un problème réseau, veille prolongée ou agent MDM endommagé.

Documentation : [Inventaire Jamf Pro](https://learn.jamf.com/bundle/jamf-pro-documentation/page/Inventory.html)

### Conformité et interprétation des alertes

Jamf Pro ne remplace pas un outil GRC complet, mais permet de construire des **Smart Groups de conformité** : macOS < version cible, FileVault désactivé, agent absent, disque libre < 10 Go, jailbreak détecté (iOS). Croisez ces groupes avec des politiques correctives ou des notifications Self Service.

Scénario triage : trois Mac signalent des alertes.

1. **Agent MDM absent ou check-in stale** : priorité haute — sans agent, aucune politique n’atteint la machine. Vérifier réinstallation Jamf, certificat MDM, conflit profil manuel.
2. **OS obsolète** : risque sécurité et incompatibilité apps. Planifier mise à niveau via politique ou DDM si activé.
3. **Disque plein** : empêche caches, logs et installations. Politique de nettoyage ou ticket utilisateur.

Ordre recommandé : confirmer gestion MDM → vérifier OS et disque → ouvrir ticket ou lancer politique corrective.

### Extension Attributes et reporting

Les EA calculés par script (bash/zsh sur Mac, extension iOS) enrichissent l’inventaire : niveau de patch, ownership, statut encryption. Ils alimentent Smart Groups sans saisie manuelle. Attention à la fréquence d’exécution : un script lourd à chaque check-in dégrade l’expérience utilisateur.

Exportez inventaire via API Jamf Pro ou rapports planifiés pour alimenter SIEM, CMDB ou Power BI. Les champs serialNumber, udid et jamfBinaryChecksum sont essentiels pour corréler avec ABM et tickets support.

### Intégration ABM et cohérence inventaire

Les appareils assignés dans Apple Business Manager doivent apparaître dans Jamf après enrôlement ADE. Un écart ( présent ABM, absent Jamf ) indique un échec d’assistant de configuration ou un mauvais serveur MDM assigné. Vérifiez le jeton MDM Jamf dans ABM et l’historique d’enrôlement.

### Actions correctives typiques

- **Reconduit MDM** : supprimer frameworks corrompus via politique ou réenrôler via ADE wipe.
- **Mise à jour OS** : politique récurrente + Smart Group « non conforme version ».
- **Espace disque** : script purge caches, notification Self Service, seuil EA.

### Recherche avancée et tableaux de bord

La **Advanced Computer Search** et **Advanced Mobile Device Search** permettent de croiser critères (OS, apps, EA, membership Smart Group) et d’exporter CSV pour audits trimestriels. Planifiez des recherches enregistrées pour les comités sécurité : FileVault off, dernier check-in > 7 jours, profil Wi-Fi manquant. Ces vues complètent les Smart Groups dynamiques sans dupliquer la logique de conformité.

L’inventaire Jamf bien exploité transforme des alertes dispersées en file de remédiation priorisée et mesurable.`,
        gameInstructions:
          'Priorisez le triage de trois Mac non conformes en commençant par la validité MDM, puis OS et espace disque.',
      },
      'enrollment-apple-integration': {
        summary:
          'Relier Apple Business Manager, certificats Push MDM et Automated Device Enrollment pour une flotte supervisée entièrement gérée par Jamf Pro.',
        learningObjectives: [
          'Configurer et renouveler le certificat Push Apple MDM dans Jamf Pro.',
          'Synchroniser le jeton MDM Jamf avec Apple Business Manager.',
          'Assigner appareils au serveur Jamf et déployer un profil ADE.',
          'Valider l’expérience Setup Assistant et la supervision automatique.',
        ],
        keyTakeaways: [
          'Sans certificat Push valide, aucune commande MDM n’atteint les appareils.',
          'L’assignation ABM → serveur Jamf déclenche l’ADE au premier démarrage.',
          'La supervision est requise pour profils non supprimables et restrictions avancées.',
          'Testez toujours un appareil pilote avant réception de masse.',
        ],
        lessonContent: `## Enrôlement et intégration Apple dans Jamf Pro

L’enrôlement automatisé (Automated Device Enrollment, ADE) est le socle des flottes Apple d’entreprise : l’appareil est supervisé dès l’assistant de configuration, sans intervention manuelle de l’utilisateur pour installer le profil MDM. Jamf Pro s’intègre via Apple Business Manager (ABM) ou Apple School Manager (ASM).

### Certificat Push MDM

Le protocole Apple MDM repose sur **Apple Push Notification service** (APNs). Jamf Pro possède un certificat Push unique (souvent renouvelé annuellement) qui authentifie le serveur auprès d’Apple. Sans certificat valide, les appareils affichent « Cannot connect to MDM » et les check-in échouent.

Dans Jamf Pro : **Settings → Global → Apple Push Certificates**. Téléchargez le CSR Jamf, signez-le dans le portail Apple ID dédié (identity.apple.com/pushcert), uploadez le certificat. Planifiez une alerte 30 jours avant expiration.

Documentation : [Certificat Push Jamf](https://learn.jamf.com/bundle/jamf-pro-documentation/page/Apple_Push_Certificate.html)

### Jeton MDM et Apple Business Manager

Jamf Pro génère un **Server Token** à importer dans ABM (Settings → MDM Server Connection). Ce jeton lie votre instance Jamf à l’organisation Apple. Renouvelez-le avant expiration (typiquement annuel).

Dans ABM : assignez les appareils (achat direct ou revendeur) au **serveur MDM Jamf**. Au premier démarrage ou après effacement, l’appareil contacte Jamf et reçoit le profil d’enrôlement ADE.

Référence Apple : [Configurer un appareil pour le MDM](https://support.apple.com/fr-fr/102571)

### Profil ADE et Setup Assistant

Le **PreStage enrollment** (ou profil ADE Jamf) définit :

- Site Jamf, groupe d’assignation, nommage automatique.
- Skip de panneaux Setup Assistant (Apple ID, Siri, etc.) selon politique.
- Supervision obligatoire et verrouillage MDM (non removable).
- Wi-Fi temporaire ou profil de bootstrap si nécessaire.

Créez un PreStage pilote pour dix appareils max, testez sur un Mac ou iPad neuf, puis élargissez. Les PreStages multiples permettent des parcours différents (étudiants vs staff).

### Scénario : vingt Mac neufs

1. Confirmer certificat Push et jeton MDM valides dans Jamf.
2. Vérifier que les Mac apparaissent dans ABM (numéros de série synchronisés sous 24–72 h après achat).
3. Assigner les Mac au serveur Jamf dans ABM.
4. Associer le PreStage ADE correct (scope par type d’appareil).
5. Allumer un Mac pilote : l’assistant affiche l’écran Remote Management ; l’appareil arrive Managed + Supervised dans Jamf.
6. Valider profils bootstrap, apps VPP et politiques initiales.

### SCEP, PKI et profils post-enrôlement

Après ADE, déployez profils SCEP pour certificats réseau, profils Wi-Fi/VPN, restrictions et apps VPP. L’ordre compte : certificat identité avant profil Wi-Fi 802.1X. Jamf Pro permet chaîner des profils via un même Smart Group « newly enrolled ».

### Dépannage enrôlement

- **Stuck on Remote Management** : vérifier connectivité, DNS, certificat Push.
- **Non supervised** : ADE non utilisé ; réeffacement avec profil ADE assigné.
- **Mauvais site Jamf** : PreStage incorrect ou scope device type erroné.

### Renouvellement et gouvernance des jetons

Documentez dates d’expiration du certificat Push, du Server Token ABM et des certificats SCEP/PKI associés aux profils bootstrap. Une alerte calendrier 45 jours avant échéance évite une coupure MDM silencieuse. Conservez un runbook de renouvellement testé en labo : sans Push valide, aucune commande de lock, wipe ou déploiement profil n’atteint la flotte.

Maîtriser ABM + Push + PreStage garantit une flotte Jamf supervisée, reproductible et alignée sur les exigences sécurité Apple.`,
        gameInstructions:
          'Ordonnez les étapes pour intégrer vingt Mac neufs depuis Apple Business Manager jusqu’à la validation du premier appareil géré.',
      },
    },
  },
  'intune-ios-enrollment': {
    description: `Ce parcours s’adresse aux administrateurs Microsoft 365, aux ingénieurs endpoint et aux équipes sécurité qui déploient iPhone et iPad via Microsoft Intune. Vous configurerez l’enrôlement automatisé (ADE) depuis Apple Business Manager, construirez des politiques de conformité iOS/iPadOS, et protégerez les données Microsoft 365 avec App Protection Policies (MAM) et Conditional Access dans Entra ID.

L’objectif est de relier l’écosystème Apple (supervision, profils, ADE) aux exigences Zero Trust Microsoft : appareil conforme ou application approuvée avant accès aux données Exchange, Teams ou SharePoint. Chaque module inclut des liens vers Microsoft Learn et les guides Apple correspondants.

Prérequis : tenant Microsoft 365 avec Intune licencié, rôle Intune Administrator ou équivalent, accès Apple Business Manager, et notions de Conditional Access. Une flotte de test iOS/iPadOS (physique ou Apple Configurator) est fortement recommandée.`,
    modules: {
      'ade-enrollment-basics': {
        summary:
          'Associer Apple Business Manager à Intune, créer un profil ADE et valider l’enrôlement supervisé via l’assistant de configuration iOS/iPadOS.',
        learningObjectives: [
          'Synchroniser le certificat MDM Apple et le token ABM avec le tenant Intune.',
          'Créer et assigner un profil Enrollment Program (ADE) aux appareils ABM.',
          'Comprendre supervision, verrouillage MDM et options Setup Assistant.',
          'Valider l’inscription Intune et l’affichage Managed sur un iPad pilote.',
        ],
        keyTakeaways: [
          'Le token Apple MDM dans Intune doit être renouvelé avant expiration.',
          'Les appareils ABM assignés à Intune s’enrôlent automatiquement au setup.',
          'La supervision débloque restrictions et profils non supprimables.',
          'Testez un appareil pilote avant déploiement de flotte.',
        ],
        lessonContent: `## Automated Device Enrollment avec Intune

Microsoft Intune gère iOS/iPadOS via le protocole Apple MDM. **Automated Device Enrollment** (ADE, anciennement DEP) supervise les appareils dès l’assistant de configuration, sans que l’utilisateur doive accepter manuellement un profil non supervisé — condition essentielle pour les établissements scolaires et les flottes corporate Zero Trust.

### Prérequis tenant et rôles

Dans le centre d’administration Microsoft Intune (endpoint.microsoft.com), vérifiez les rôles **Intune Administrator** ou **Apple MDM Push Certificate Manager**. Le tenant doit disposer de licences Intune adéquates (incluses dans M365 E3/E5 ou Business Premium selon offre).

Documentation : [Configurer l’inscription ADE](https://learn.microsoft.com/fr-fr/mem/intune/enrollment/device-enrollment-program-enroll-ios)

### Certificat Apple MDM Push

Intune utilise un certificat Push Apple distinct de Jamf : dans **Devices → iOS/iPadOS → iOS/iPadOS enrollment → Apple MDM Push Certificate**, téléchargez le CSR Intune et signez-le sur identity.apple.com/pushcert avec un Apple ID organisationnel. Uploadez le certificat .pem. Renouvelez-le annuellement ; une expiration coupe toutes les commandes MDM.

### Token Apple Business Manager

Dans ABM : **Preferences → MDM Server Assignment**, ajoutez le serveur Microsoft Intune via le token téléchargé depuis Intune (**Enrollment Program Token**). Les appareils achetés ou assignés par votre revendeur apparaissent dans ABM sous 24 à 72 heures.

Assignez les iPad ou iPhone au serveur Intune. Au premier démarrage (ou après effacement complet), l’appareil contacte Intune et reçoit le profil d’enrôlement ADE correspondant.

Référence Apple : [Apple Business Manager User Guide](https://support.apple.com/fr-fr/guide/apple-business-manager/)

### Profil ADE Intune

Créez un **Enrollment Profile** Intune :

- Type : Supervised, locked enrollment (MDM non removable).
- User affinity : Device (partagé) ou User (BYOD corporate) selon scénario.
- Setup Assistant options : masquer Apple ID, Siri, écran analytique si politique l’exige.
- Assignation à un groupe d’appareils ABM synchronisé.

Associez le profil aux appareils via ABM ou filtres de groupes dynamiques Intune après sync.

### Scénario : trente iPad scolaires

1. Confirmer certificat Push et token ABM actifs dans Intune.
2. Assigner les iPad au serveur MDM Microsoft dans ABM.
3. Créer le profil ADE (supervisé, skip Apple ID si stratégie shared device).
4. Assigner profils Wi-Fi, restrictions et apps cibles au groupe « iPad élèves ».
5. Allumer un iPad pilote : vérifier Remote Management, statut **Managed** dans Intune, conformité initiale.

### Après enrôlement : profils et SCEP

Déployez profils de configuration Intune : Wi-Fi, VPN, certificats SCEP/PKI, restrictions. Ordre recommandé : certificat identité SCEP → profil Wi-Fi 802.1X → apps VPP ou store. Intune signale les conflits de profils dans le rapport device configuration.

### Dépannage courant

- **Token ABM expiré** : resync dans Intune et ABM.
- **Appareil non supervisé** : ADE non appliqué ; effacement et reassignation.
- **Stuck enrollment** : DNS, pare-feu sortant vers Apple et Microsoft, date/heure.

### Shared iPad et scénarios éducatifs

Pour les iPad partagés, configurez **Shared Device Mode** ou des profils sans user affinity selon votre modèle pédagogique. Les apps VPP assignées au device rather than user accélèrent la mise à disposition en classe. Validez que les profils Wi-Fi et restrictions survivent au redémarrage et que la conformité Intune remonte correctement après la première connexion élève.

ADE + Intune pose les fondations d’un parc iOS supervisé, prêt pour conformité et Conditional Access.`,
        gameInstructions:
          'Ordonnez les étapes pour préparer trente iPad scolaires depuis ABM jusqu’à la validation du premier appareil géré Intune.',
      },
      'compliance-policies': {
        summary:
          'Définir, assigner et remédier des politiques de conformité Intune pour iOS/iPadOS : version OS, code PIN, jailbreak et actions automatiques.',
        learningObjectives: [
          'Créer des politiques de conformité iOS avec seuils OS, PIN et Threat Level.',
          'Assigner des actions de non-conformité : notification, marquer non conforme, retrait sélectif.',
          'Corréler état conformité avec Conditional Access et rapports Intune.',
          'Prioriser remédiation jailbreak et OS critique avant alertes mineures.',
        ],
        keyTakeaways: [
          'Le jailbreak doit déclencher action immédiate (blocage ou retrait).',
          'Un PIN faible ou absent viole la plupart des baselines Zero Trust.',
          'Les actions de non-conformité automatisent la réponse sans ticket manuel.',
          'La conformité Intune alimente Conditional Access « appareil conforme ».',
        ],
        lessonContent: `## Politiques de conformité iOS dans Intune

Les **compliance policies** Intune définissent les exigences minimales qu’un iPhone ou iPad doit satisfaire pour être considéré conforme. Couplées à Conditional Access, elles bloquent l’accès aux données M365 si l’appareil est compromis, obsolète ou non chiffré.

Documentation : [Politiques de conformité iOS/iPadOS](https://learn.microsoft.com/fr-fr/mem/intune/protect/device-compliance-get-started)

### Création d’une baseline iOS

Dans **Devices → Compliance policies → Create policy → iOS/iPadOS**, configurez typiquement :

- **Version minimale iOS/iPadOS** : ex. 17.0 ou n-1 selon politique sécurité.
- **PIN / mot de passe** : longueur minimale, complexité, délai avant verrouillage.
- **Jailbreak / rooted** : marquer non conforme immédiatement.
- **Threat level** (Defender for Endpoint mobile si activé) : intégration signaux menace.

Assignez la politique à un groupe dynamique « iOS corporate ». Délai de grâce (grace period) optionnel avant action pour laisser l’utilisateur corriger.

### Actions de non-conformité

**Actions for noncompliance** définissent la réponse automatique :

1. Envoi email / push notification (mise à jour OS, exiger PIN).
2. Marquer non conforme après X jours.
3. **Retire access** ou blocage via Conditional Access.
4. Effacement sélectif ou complet en dernier recours (devices hautement sensibles).

Le jailbreak détecté exige action immédiate sans grâce : l’appareil est compromis cryptographiquement ; faites passer la priorité avant un simple retard de patch OS.

### Scénario triage : trois iPhone

| État | Priorité | Action |
|------|----------|--------|
| Jailbreak détecté | Critique | Isoler du réseau, retrait accès M365, ticket sécurité |
| OS obsolète | Haute | Notification mise à jour, grace period, blocage CA |
| PIN absent | Moyenne | Push utilisateur, exiger code sous 24 h |

Consultez **Devices → Monitor → Noncompliant devices** pour filtrer par politique et raison.

### Corrélation Conditional Access

Une règle CA typique exige **Require device to be marked as compliant** pour Exchange Online, SharePoint, Teams. Sans conformité Intune, l’utilisateur reçoit une erreur et est guidé vers Company Portal pour remédiation.

Complétez avec **Require approved client app** pour forcer Outlook/Edge protégés par MAM si BYOD.

### Rapports et audit

Utilisez **Device compliance** reporting et export Azure Monitor. Documentez exceptions temporaires (break glass) avec date d’expiration. Les auditeurs vérifient jailbreak response et preuve de patch OS ≤ 30 jours.

### Bonnes pratiques

- Tester politiques sur groupe pilote avant production.
- Aligner version OS minimale sur cycle Apple + validation apps métier.
- Communiquer avant durcissement PIN pour réduire helpdesk.
- Ne pas mélanger conformité device (MDM) et MAM-only sans CA adaptée.

### Supervision, chiffrement et profils complémentaires

Sur appareil **supervisé** via ADE, les politiques de conformité peuvent exiger des niveaux de menace Defender et des versions iOS/iPadOS non négociables. Combinez-les avec des profils de configuration : restrictions (App Store, diagnostics), Wi-Fi d’entreprise, certificats SCEP pour l’accès réseau interne. Un appareil peut recevoir un profil réseau réussi tout en restant non conforme si le PIN est absent — d’où l’importance de croiser rapports profils et rapports conformité dans Intune.

### Cycle de vie et communication

Planifiez les hausses de version OS minimale après chaque keynote Apple : période de grâce de quatorze jours, email utilisateur, puis enforcement CA. Les équipes helpdesk doivent disposer d’une fiche remédiation standard (mise à jour iOS, définition PIN, signalement jailbreak) pour réduire le temps de résolution des tickets Intune.

Les politiques de conformité Intune traduisent votre baseline sécurité en signaux automatisés exploitables par Entra ID.`,
        gameInstructions:
          'Priorisez les actions admin face à un iPhone jailbreaké, un OS obsolète et un PIN absent.',
      },
      'app-protection-conditional-access': {
        summary:
          'Protéger Outlook, Teams et données M365 sur iOS avec App Protection Policies Intune et Conditional Access Entra ID pour BYOD et flottes mixtes.',
        learningObjectives: [
          'Créer des App Protection Policies (MAM) iOS avec chiffrement, PIN et transfert restreint.',
          'Configurer Conditional Access exigeant apps approuvées ou appareil conforme.',
          'Distinguer scénarios MDM complet, MAM-only et BYOD.',
          'Valider conteneur de données et expérience utilisateur sur iPhone pilote.',
        ],
        keyTakeaways: [
          'MAM protège les données au niveau application sans enrôler l’appareil entier.',
          'Conditional Access lie identité, app approuvée et état conforme.',
          'Le copier-coller vers apps non protégées doit être bloqué par politique.',
          'Testez Outlook/Teams avec compte pilote avant généralisation.',
        ],
        lessonContent: `## App Protection et Conditional Access sur iOS

Microsoft Intune propose deux leviers complémentaires : **Mobile Application Management** (MAM / App Protection Policies) pour sécuriser les données inside Outlook, Teams, Edge sans contrôle total de l’appareil, et **Conditional Access** dans Entra ID pour autoriser ou bloquer l’accès aux services cloud selon identité, app client, état conforme et localisation.

### App Protection Policies iOS

Dans **Apps → App protection policies**, créez une politique **iOS/iPadOS** ciblant applications Microsoft (Outlook, Teams, OneDrive) ou line-of-business.

Paramètres clés :

- **PIN** pour ouvrir app protégée, recheck après timeout.
- **Chiffrement** des données au repos dans conteneur applicatif.
- **Transfert de données** : bloquer copie vers apps non protégées, Save As restreint.
- **Sélective wipe** : effacer données corporate si retrait Intune ou non-conformité.

Assignez à utilisateurs Azure AD ; les apps doivent être **Intune wrapped** ou Microsoft officielles supportant SDK MAM.

Documentation : [App Protection Policies](https://learn.microsoft.com/fr-fr/mem/intune/apps/app-protection-policy)

### Conditional Access : architecture Zero Trust

Exemple de stratégie pour iPhone BYOD :

1. **Require approved client app** ou **Require app protection policy** pour Exchange/SharePoint.
2. **Require device to be marked as compliant** OU **Require Microsoft Intune app protection** selon modèle (COPE vs BYOD).
3. Bloquer legacy auth et exiger MFA.

Les policies s’évaluent à chaque connexion ; un changement jailbreak rend l’appareil non conforme → blocage accès email en minutes.

Référence : [Vue d’ensemble Conditional Access](https://learn.microsoft.com/fr-fr/entra/identity/conditional-access/overview)

### Scénario : Outlook et Teams sur BYOD

Ordre de mise en œuvre recommandé :

1. Créer et assigner **App Protection Policy** iOS (PIN, chiffrement, blocage copie).
2. Publier Company Portal si enrollment MDM requis pour certains utilisateurs.
3. Configurer **Conditional Access** : cloud apps = Office 365, client apps = Mobile, grant = Require app protection OR compliant device.
4. Sur iPhone pilote : installer Outlook/Teams, se connecter, vérifier badge organisation, tester copie vers Notes (doit échouer), valider accès Teams meeting.

### MDM + MAM + CA : choix de modèle

| Modèle | MDM | MAM | CA typique |
|--------|-----|-----|------------|
| Corporate fully managed | Oui | Optionnel | Compliant device |
| BYOD | Non | Oui | App protection required |
| COPE | Oui | Oui | Compliant + app protection |

Sur flotte supervisée ADE, combinez conformité device et MAM pour apps sensibles.

### PKI et accès réseau adjoint

Les apps protégées accèdent aux données cloud via TLS ; l’accès réseau interne peut exiger certificat SCEP déployé via profil Intune (Wi-Fi/VPN 802.1X). Assurez cohérence entre certificat identité et Conditional Access (certificat client rare sur mobile, privilégier app tunnel ou VPN moderne).

### Validation et support utilisateur

Préparez communication : installation apps depuis store, acceptation PIN MAM, différences entre icône personnelle et conteneur corporate. Surveillez sign-ins CA dans Entra ID → Monitoring pour erreurs **53003** (blocked by CA).

### Tests de régression et rollback

Avant généralisation, documentez un plan de rollback : désactivation temporaire de la règle CA la plus restrictive, conservation d’une politique MAM permissive en mode report-only si disponible, et comptes pilote hors groupe production. Rejouez les scénarios copier-coller, pièce jointe et réunion Teams après chaque modification de politique pour éviter les blocages métier en heures ouvrées.

En combinant App Protection et Conditional Access, Intune sécurise M365 sur iOS même lorsque l’organisation ne possède pas entièrement l’appareil — pilier des déploiements hybrides Apple + Microsoft.`,
        gameInstructions:
          'Ordonnez le déploiement Outlook/Teams protégés : politique App Protection, Conditional Access, puis validation sur iPhone pilote.',
      },
    },
  },
};

export function getCoursePedagogy(courseSlug: string): CoursePedagogy | undefined {
  return COURSE_PEDAGOGY[courseSlug];
}

export function getModulePedagogy(
  courseSlug: string,
  moduleSlug: string
): ModulePedagogy | undefined {
  return COURSE_PEDAGOGY[courseSlug]?.modules[moduleSlug];
}

export function countLessonWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_\-|`]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function getContentStats(): {
  courses: number;
  modules: number;
  totalQuestions: number;
  questionsPerModule: Record<string, number>;
  lessonWordsPerModule: Record<string, number>;
} {
  const questionMaps = [
    appleCertPrepQuestions,
    jamfProFoundationsQuestions,
    intuneIosEnrollmentQuestions,
  ];

  const questionsPerModule: Record<string, number> = {};
  let totalQuestions = 0;

  for (const map of questionMaps) {
    for (const [slug, questions] of Object.entries(map)) {
      questionsPerModule[slug] = questions.length;
      totalQuestions += questions.length;
    }
  }

  const lessonWordsPerModule: Record<string, number> = {};
  let modules = 0;
  let courses = 0;

  for (const course of Object.values(COURSE_PEDAGOGY)) {
    courses += 1;
    for (const [moduleSlug, module] of Object.entries(course.modules)) {
      modules += 1;
      lessonWordsPerModule[moduleSlug] = countLessonWords(module.lessonContent);
    }
  }

  return {
    courses,
    modules,
    totalQuestions,
    questionsPerModule,
    lessonWordsPerModule,
  };
}
