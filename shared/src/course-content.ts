import {
  appleCertPrepQuestions,
  intuneIosEnrollmentQuestions,
  jamfProFoundationsQuestions,
} from './quiz-content';
import { countLessonWords, sumLessonReadingMinutes } from './reading-time';

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

**Ce que vous saurez faire :** Diagnostiquer un Mac ou un iPhone bloqué selon la méthode Apple sans effacer de données prématurément ; vérifier les sauvegardes chiffrées avant toute restauration ; traiter Activation Lock et supervision ABM dans un scénario réaliste de 200 iPhones d'entreprise ; documenter chaque intervention SAV de façon conforme RGPD ; et préparer méthodiquement l'examen Device Support avec des runbooks reproductibles en atelier.

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
          'Piloter la réception d’une vague de 200 iPhones : vérifier ABM, ADE et premier check-in MDM avec l’équipe déploiement.',
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

### Cas pratique : réception de 200 iPhones en entreprise

Une filiale retail reçoit 200 iPhone 15 via un revendeur Apple autorisé. Les numéros de série apparaissent dans Apple Business Manager sous 48 à 72 heures. L'équipe IT assigne les appareils au serveur MDM (Jamf Pro ou Intune) et active un profil ADE supervisé avec enrôlement MDM obligatoire. Le technicien support de premier niveau intervient lors des premières livraisons : confirmer l'écran Remote Management à l'assistant de configuration, vérifier l'état Managed dans la console MDM, tester le Wi-Fi d'entreprise et l'installation des apps VPP (Microsoft Teams, app métier interne).

Lorsqu'un collaborateur signale « mon iPhone ne s'allume plus », le technicien applique la séquence non destructive (charge, redémarrage forcé) avant d'escalader vers l'admin MDM ou le SAV Apple. Si l'appareil doit être restitué (départ employé), coordonner avec l'équipe MDM pour un wipe sélectif ou une réinitialisation supervisée — jamais un effacement local non tracé qui laisserait Activation Lock actif.

### Supervision Apple et différences utilisateur final

Un appareil **supervisé** via ADE accepte des restrictions que l'utilisateur ne peut pas contourner : suppression du profil MDM, installation d'apps non approuvées, modification de certains réglages réseau. Le technicien L1 doit savoir expliquer ces différences sans promettre un « déverrouillage » hors procédure. Sur iOS, Réglages → Général → Informations → Supervision confirme l'état.

> **Bonne pratique :** Avant toute restauration sur un appareil d'entreprise, capturez numéro de série, UDID (via Finder ou console MDM) et état Find My / Activation Lock dans le ticket — jamais les identifiants en clair. Référez-vous au [Guide Apple Business Manager](https://support.apple.com/fr-fr/guide/apple-business-manager/) pour les procédures de retrait organisationnel et de recyclage parc.

### Coordination support L1 et administrateur MDM

Le support terrain et l'admin MDM partagent un runbook commun : le L1 documente symptômes et tests non destructifs ; l'admin MDM vérifie check-in, profils en échec et commandes en attente. Cette séparation évite les restaurations massives qui casseraient la conformité d'une flotte de 200 appareils. En cas de doute sur la propriété ABM, consultez le portail ABM avant toute réinitialisation.



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
          'Diagnostiquer une perte de check-in MDM groupée après maintenance certificat Push ou renouvellement jeton ABM.',
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

Cette séquence respecte les contraintes de sécurité tout en minimisant l’impact utilisateur.
### Cas pratique : 200 iPhones — échec Wi-Fi après migration PKI

Une entreprise de 200 iPhones supervisés Jamf Pro migre sa PKI interne un vendredi soir. Lundi matin, 40 appareils ne joignent plus le Wi-Fi 802.1X. Le support L1 vérifie d'abord date/heure automatiques et oublie le réseau sur trois appareils pilotes. L'admin MDM confirme que les profils SCEP ont échoué : certificats expirés ou CA incorrecte dans le payload.

La remédiation passe par un redéploiement du profil SCEP puis du profil Wi-Fi sur un Smart Group « Wi-Fi non conforme », pas par 40 restaurations individuelles. Les apps VPP restées « En attente » sur le même périmètre indiquent souvent un blocage réseau vers les CDN Apple (gsp/appldnld) — à distinguer d'un problème MDM Push.

### Apps VPP et états « En attente »

Les apps Volume Purchase Program (VPP) déployées via MDM nécessitent une licence assignée au device ou à l'utilisateur et une connectivité vers les serveurs Apple. Si Safari fonctionne mais Teams MDM reste en attente, suspectez filtrage proxy, DNS interne ou restriction de contenu. Vérifiez dans Jamf ou Intune le statut de la commande InstallApplication et les logs côté appareil via Console macOS.

> **Bonne pratique :** Ne supprimez jamais le profil MDM manuellement sur un iPhone supervisé. Préférez une commande Refresh cellular plans, une resynchronisation forcée ou une politique de réinstallation profil depuis la console. Documentation : [Supervision des appareils Apple](https://support.apple.com/fr-fr/HT208305).

### Perte groupée de check-in MDM

Si plusieurs iPhones perdent simultanément le check-in après maintenance serveur, vérifiez en priorité le certificat Push APNs MDM (expiration, mauvais topic). Un changement de certificat mal importé peut nécessiter un réenrôlement. Croisez la date de dernière check-in dans la console avec l'historique des changements certificats côté admin.

`,
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
          'Expliquer à un responsable MDM pourquoi une restauration locale peut nécessiter un réenrôlement ADE sur appareil supervisé.',
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
### Cas pratique : MacBook en SAV avec profil MDM actif

Un MacBook Pro corporate revient en atelier pour clavier défectueux. Le technicien ACMT doit coordonner avec l'admin MDM : le profil de gestion survive-t-il à la réparation ? En général oui si le disque n'est pas effacé, mais un remplacement carte logique ou SSD peut imposer un réenrôlement ADE. Documentez numéro de série, état FileVault (clé escrowed dans Jamf/Intune) et autorisation wipe si le disque doit être remplacé.

Avant restitution, validez clavier, trackpad, caméra, Wi-Fi entreprise et présence du profil MDM. Retirez tout compte admin atelier temporaire. Le client entreprise attend une traçabilité complète — l'examen Device Support teste cette rigueur procédurale.

### ADE, tokens et continuité après restauration

Sur appareil supervisé via Automated Device Enrollment, une restauration complète reprovisionne automatiquement le MDM si l'assignation ABM est toujours active. Le technicien doit connaître cette différence avec un Mac personnel où l'utilisateur peut refuser le profil. Le renouvellement annuel du jeton serveur MDM Apple dans ABM n'affecte pas les appareils déjà inscrits, mais bloque les nouveaux enrôlements si le jeton expire.

> **Bonne pratique :** Conservez un runbook atelier imprimé : alimentation → Apple Diagnostics → codes erreur → ticket → escalade MDM si profil présent. Référence : [Apple Diagnostics sur Mac](https://support.apple.com/fr-fr/102436).

### Préparation examen : scénarios MDM adjacents

Les questions situées de l'examen peuvent mentionner supervision, Activation Lock organisationnel ou impact d'une restauration sur un parc géré. Entraînez-vous à expliquer pourquoi le contournement Activation Lock est interdit et quelles voies ABM/MDM sont légitimes. Cette articulation support ↔ MDM distingue un candidat mature d'un technicien consumer-only.



En consolidant sécurité, diagnostics, restauration et documentation, vous alignez votre pratique quotidienne sur le référentiel Apple Device Support tout en restant crédible face à un administrateur MDM ou un responsable de parc.`,
        gameInstructions:
          'Remettez dans l’ordre les étapes de diagnostic d’un Mac hors tension après une panne électrique, conformément au runbook atelier.',
      },
      'apps-vpp-management': {
        summary:
          'Comprendre VPP, apps gérées et distribution sur appareils supervisés — du ticket support à la coordination avec l’admin MDM.',
        learningObjectives: [
          'Expliquer le rôle de VPP dans Apple Business Manager et la différence apps gérées vs App Store personnel.',
          'Diagnostiquer une app métier absente ou bloquée sur iPhone supervisé (licence, check-in, réseau).',
          'Identifier les apps Managed Apps et les conséquences d’un wipe sélectif sur les données professionnelles.',
          'Coordonner avec l’admin MDM pour réinstallation, retrait licence ou réassignation device-based.',
          'Documenter un incident app (bundle ID, version, dernière sync MDM) avant escalade niveau 2.',
        ],
        keyTakeaways: [
          'VPP centralise les licences dans ABM ; le MDM pousse l’installation sans Apple ID personnel.',
          'Une app « en attente » prolongée pointe souvent vers réseau, licence épuisée ou profil MDM en échec.',
          'Sur appareil supervisé, l’utilisateur ne peut pas retirer une app gérée comme sur un iPhone perso.',
          'Le support L1 vérifie check-in MDM et Wi-Fi avant d’ouvrir un ticket admin pour InstallApplication.',
        ],
        lessonContent: `## Gestion des apps et VPP en entreprise

Dans un parc d’entreprise supervisé via Automated Device Enrollment, les applications ne se comportent pas comme sur un iPhone personnel. Le technicien Device Support doit comprendre comment Apple Business Manager, le programme VPP (Volume Purchase Program) et le serveur MDM collaborent pour distribuer Teams, apps métier ou outils internes sans compte Apple ID personnel de l’employé.

### VPP et Apple Business Manager

**VPP** permet à l’organisation d’acheter des licences d’apps et de livres en volume. Les achats sont rattachés au portail **ABM** : l’administrateur assigne les licences à un serveur MDM (Jamf Pro, Intune, autre). Le MDM envoie ensuite la commande InstallApplication aux appareils ciblés. L’utilisateur final voit l’icône apparaître sans saisir mot de passe App Store — condition essentielle pour flottes partagées, retail ou éducation.

Deux modes dominent : assignation **device-based** (licence liée à l’appareil, idéal pour iPad partagés) et assignation **user-based** (licence liée à un Managed Apple ID). Le technicien support n’administre pas ABM au quotidien, mais doit savoir qui contacter quand une app manque sur 200 iPhone identiques.

Référence : [Apps et livres dans Apple Business Manager](https://support.apple.com/fr-fr/guide/apple-business-manager/)

### Apps gérées vs apps personnelles

Une **app gérée** (Managed App) est installée ou mise à jour par le MDM. Sur appareil **supervisé**, l’utilisateur ne peut généralement pas la supprimer ; les données peuvent être effacées sélectivement lors d’un départ (wipe sélectif) sans toucher aux photos personnelles si l’appareil est en User Enrollment — hors scope ici, focus ADE supervisé.

Le technicien L1 reçoit souvent « mon app métier a disparu ». Avant toute restauration destructive :

1. Confirmer Wi-Fi/cellulaire et date/heure.
2. Vérifier dans Réglages → Général → VPN et gestion des appareils que le profil MDM est présent.
3. Demander à l’admin MDM l’état InstallApplication et la dernière **check-in MDM**.
4. Noter bundle ID, version attendue et heure du dernier succès si visible dans l’inventaire.

### Symptômes courants et triage

**Icône grisée « En attente… »** : souvent réseau filtré, proxy bloquant les CDN Apple, ou espace disque insuffisant. Faire tester un réseau alternatif (partage connexion labo) avant wipe.

**App absente après réinitialisation supervisée** : normal si le MDM n’a pas encore renvoyé les apps au prochain check-in. Attendre 15–30 minutes connecté au Wi-Fi entreprise ; forcer une sync via l’admin si disponible.

**« Impossible d’installer » pour toute la flotte** : suspecter licence VPP expirée, token MDM Apple renouvelé incorrectement, ou app retirée du catalogue ABM. Escalade admin immédiate — le L1 documente l’ampleur (combien d’appareils, même site ou global).

**Conflit avec Apple ID personnel** : sur appareil supervisé ADE avec apps VPP device-based, l’utilisateur ne devrait pas avoir à mélanger achats perso pour l’app pro. Si l’organisation autorise App Store perso via restriction assouplie, documenter la politique interne.

### Managed Apple ID et contexte scolaire

En **ASM** (Apple School Manager), les élèves utilisent souvent un **Managed Apple ID**. Les apps pédagogiques passent par VPP et MDM ; le technicien support vérifie que l’iPad est toujours supervisé et que le compte managed est actif. Un iPad « non managé » après effacement non ADE perd les apps institutionnelles jusqu’à réenrôlement.

### Coordination support ↔ administrateur MDM

Runbook recommandé pour ticket app :

- Numéro de série, modèle, version iOS/iPadOS.
- Nom exact de l’app et usage métier.
- Capture ou description du message d’erreur App Store / MDM.
- Tests réseau effectués (Wi-Fi invité vs corporate, DNS).
- Confirmation que le collègue voit la même app sur un autre appareil du même groupe.

L’admin MDM vérifie côté console : licence disponible, scope Smart Group / groupe d’appareils, statut commande, logs APNs si check-in stale. Le technicien ne relance pas une restauration complète qui retarderait uniquement une app manquante.

### Cas pratique : déploiement Teams sur 200 iPhone retail

Une enseigne reçoit 200 iPhone supervisés ADE. L’admin assigne Microsoft Teams via VPP device-based et une politique MDM « Required ». Jour J, 15 collaborateurs signalent l’absence de Teams.

Le support L1 constate que les 15 appareils sont sur le Wi-Fi magasin avec port 443 OK mais filtrage App Store partiel. Bascule test sur LTE : l’app s’installe. Ticket réseau ouvert ; pas de wipe. Cinq autres appareils n’ont jamais check-in depuis 72 h — profil MDM en échec certificat Wi-Fi ; escalade MDM pour repush profil 802.1X.

Leçon : une panne « app » est souvent réseau, profil ou licence — pas matériel.

### Wipe sélectif et fin de contrat

Lors du départ d’un employé, l’organisation peut effacer uniquement les données des apps gérées (Managed Apps) si la solution MDM et la supervision le permettent, avant restitution du matériel. Le technicien SAV doit confirmer avec l’admin MDM que le wipe a été commandé et qu’**Activation Lock** organisationnel est géré via ABM — jamais un effacement local non tracé.

> **Bonne pratique :** Pour tout incident app sur appareil supervisé, documente bundle ID, version OS, état du profil MDM et résultat d’un test réseau alternatif avant de proposer une restauration. Réfère-toi au glossaire MDM (VPP, supervision, check-in) pour le vocabulaire partagé avec l’équipe déploiement.

### Apps custom (B2B) et TestFlight

Certaines apps métier sont distribuées en B2B privé ou via lien MDM sans être visibles sur l’App Store public. Le technicien ne doit pas tenter d’installer un IPA ad hoc non approuvé : risque sécurité et violation politique entreprise. Toute app hors catalogue VPP/ABM passe par l’admin MDM et la gouvernance logicielle.

En maîtrisant VPP, apps gérées et triage réseau/MDM, le technicien Device Support réduit les restaurations inutiles et dialogue efficacement avec les administrateurs Jamf ou Intune responsables du catalogue applicatif.`,
        gameInstructions:
          'Ordonnez le triage support quand une app VPP manque sur un iPhone supervisé : réseau, profil MDM, check-in, puis escalade admin.',
      },
    },
  },
  'jamf-pro-foundations': {
    description: `Ce parcours cible les administrateurs système, les techniciens MDM confirmés et les responsables de parc Mac/iOS/iPadOS qui déploient ou administrent Jamf Pro au quotidien. Vous apprendrez à construire des Smart Groups pertinents, à piloter des politiques de configuration et de déploiement logiciel, à lire l’inventaire Jamf et à connecter votre instance à Apple Business Manager pour un enrôlement automatisé supervisé.

L’approche est pratique : chaque module s’appuie sur des scénarios réalistes (déploiement pilote, triage conformité, réception de matériel neuf) et sur les objets centraux de Jamf Pro — profils, extension attributes, politiques récurrentes, certificat Push et intégration ADE.

**Ce que vous saurez faire :** Construire des Smart Groups pilotes et déployer des paquets par vagues sur un parc de 200 Mac ou iPhone ; exploiter l'inventaire Jamf et les extension attributes pour prioriser la remédiation ; renouveler certificat Push APNs et jeton ABM sans couper la gestion MDM ; configurer un PreStage ADE pour une réception de matériel neuf ; et interroger l'API Jamf Pro pour automatiser exports et audits de conformité.

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
          'Automatiser un export d’inventaire via l’API Jamf Pro (Bearer token) pour alimenter un tableau de bord conformité.',
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
### Cas pratique : déploiement par vagues sur 200 Mac

Une ETI déploie un agent EDR sur 200 Mac via Jamf Pro. L'admin crée un Smart Group pilote de 10 Mac (mix Intel et Apple Silicon, macOS 14+), une politique Ongoing avec le .pkg, et valide les logs sur /var/log/jamf.log. Vague 2 : Smart Group « macOS 14 + site Paris » (50 Mac). Vague 3 : extension au reste du parc après 72 h sans incident.

Chaque vague documente critères Smart Group, numéro de politique et fenêtre de maintenance. Un groupe d'exclusion retire les Mac de direction et les machines de labo développement.

### API Jamf Pro : bases pour l'automatisation

Jamf Pro expose une API REST (Bearer token OAuth ou compte API selon version). Cas d'usage courants : exporter l'inventaire computers-inventory, lister les membres d'un Smart Group, déclencher un MDM command Refresh. Exemple de flux : token via /api/oauth/token → GET /api/v1/computers-inventory?section=General&filter=osVersion ge "14.0". Automatiser évite les exports CSV manuels avant comité sécurité.

Documentation : [Jamf Pro API Overview](https://developer.jamf.com/jamf-pro/docs/jamf-pro-api-overview)

> **Bonne pratique :** Testez toujours profils SCEP + Wi-Fi 802.1X sur un Smart Group pilote avant déploiement global. Un certificat mal configuré casse l'accès réseau de centaines d'appareils simultanément — prévoyez une fenêtre de chevauchement PKI lors des renouvellements.

### Self Service et apps VPP sur iOS supervisé

Sur iPhone supervisé, les apps VPP assignées via politique Jamf peuvent apparaître dans Self Service si la catégorie est configurée. Cela réduit les tickets « je ne vois pas mon app » tout en conservant un scope Smart Group strict côté serveur. Vérifiez que les licences VPP sont assignées au bon token et au mode device-based pour les flottes partagées.



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
          'Corréler inventaire Jamf, apps VPP et statut de licence pour détecter les apps manquantes sur un Smart Group pilote.',
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

L’inventaire Jamf bien exploité transforme des alertes dispersées en file de remédiation priorisée et mesurable.
### Cas pratique : audit conformité sur 200 iPhone Jamf

Avant un audit ISO 27001, l'admin Jamf crée une Advanced Mobile Device Search : supervision = true, iOS version < 17, dernière check-in > 7 jours, jailbreak = false. Export CSV pour le comité. Un second Smart Group « FileVault N/A iOS » n'a pas de sens — adaptez les critères au type d'appareil. Priorisez : jailbreak détecté (0), check-in stale (1), OS obsolète (2).

Corrélez avec ABM : un iPhone présent dans ABM mais absent de Jamf depuis 30 jours indique un effacement sans réenrôlement ou une mauvaise assignation serveur MDM.

### Apps VPP et cohérence inventaire

L'inventaire mobile Jamf liste les apps installées et leur source (App Store, VPP, autre). Si Microsoft Teams apparaît « Missing » dans une politique de conformité custom (extension attribute), vérifiez licence VPP, assignation device vs user, et statut InstallApplication dans l'historique MDM. Les apps en attente prolongées méritent un ticket réseau avant wipe.

> **Bonne pratique :** Planifiez des recherches avancées enregistrées pour les comités trimestriels : OS non conforme, check-in > 48 h, profil Wi-Fi manquant. Documentez le propriétaire de chaque recherche et la fréquence d'exécution. [Inventaire Jamf Pro](https://learn.jamf.com/bundle/jamf-pro-documentation/page/Inventory.html)

### Extension Attributes : fréquence et performance

Un EA exécuté à chaque check-in qui lance un script lourd (scan disque complet) dégrade l'expérience utilisateur. Préférez des scripts légers ou une récurrence limitée. Les EA alimentent Smart Groups de conformité — une EA vide ou stale fausse le membership et les déploiements ciblés.

### Tableaux de bord et KPI parc

Pour un comité mensuel, suivez : pourcentage Mac/iPhone avec check-in < 48 h, taux OS conforme, nombre apps VPP manquantes, FileVault activé (Mac). Jamf Pro API ou exports CSV alimentent Power BI. Un objectif réaliste sur 200 iPhone : 95 % check-in hebdomadaire et 100 % supervision ADE pour les appareils ABM.

`,
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
          'Planifier le renouvellement du jeton serveur MDM Apple et du certificat Push APNs avec fenêtre de test sur appareil pilote.',
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
### Cas pratique : renouvellement jeton ABM sans coupure

Le jeton serveur MDM Apple de Jamf expire dans 14 jours. L'admin télécharge le nouveau token depuis Jamf (Settings → Global → Apple Business Manager), l'importe dans ABM, et vérifie la synchronisation inventaire. Les 200 Mac déjà inscrits continuent de checker normalement — seuls les nouveaux appareils ABM seraient bloqués si le jeton expirait. Testez avec un iPhone de labo non inscrit assigné au serveur Jamf.

Le certificat Push APNs suit un calendrier parallèle : renouvellement via identity.apple.com/pushcert avec le même Apple ID organisationnel. Ne créez pas un nouveau topic APNs sans plan de migration — cela force un réenrôlement massif.

### PreStage ADE pour flotte de 200 appareils

Créez deux PreStages si nécessaire : un pour Mac staff (skip Apple ID, FileVault activé, admin local escrowed) et un pour iPhone terrain (Wi-Fi bootstrap, apps VPP initiales). Scope par type d'appareil dans ABM. Mandatory MDM enrollment empêche l'utilisateur de terminer l'assistant sans gestion.

> **Bonne pratique :** Conservez un runbook daté : dates expiration Push, token ABM, certificats SCEP bootstrap. Alerte 45 jours avant. Testez renouvellement en labo chaque trimestre. Apple : [Configurer le MDM](https://support.apple.com/fr-fr/102571) | Jamf : [Apple Push Certificate](https://learn.jamf.com/bundle/jamf-pro-documentation/page/Apple_Push_Certificate.html)

### Dépannage Remote Management bloqué

Si Setup Assistant reste sur Remote Management : DNS (jamfcloud.com ou instance on-prem), pare-feu sortant 443, certificat Push valide, date/heure correcte. Pour Mac Apple Silicon, vérifiez aussi la connectivité pendant la phase d'activation. Un PreStage mal scoped (mauvais type device) n'applique pas le bon profil ADE.

### Checklist réception 200 appareils ABM

Validez dans l'ordre : (1) certificat Push actif, (2) jeton MDM ABM synchronisé, (3) assignation serveur Jamf dans ABM, (4) PreStage scoped par type, (5) profils bootstrap Wi-Fi/SCEP testés, (6) apps VPP avec licences suffisantes, (7) Mac/iPhone pilote enregistré Managed + Supervised. Documentez chaque étape dans Confluence avec captures d'écran pour transfert d'équipe.



Maîtriser ABM + Push + PreStage garantit une flotte Jamf supervisée, reproductible et alignée sur les exigences sécurité Apple.`,
        gameInstructions:
          'Ordonnez les étapes pour intégrer vingt Mac neufs depuis Apple Business Manager jusqu’à la validation du premier appareil géré.',
      },
      'api-automation-advanced-policies': {
        summary:
          'Automatiser Jamf Pro via l’API REST, scripts avancés et politiques récurrentes pour industrialiser conformité, reporting et remédiation à l’échelle.',
        learningObjectives: [
          'Obtenir un token OAuth Jamf Pro et interroger les endpoints inventaire modernes (computers-inventory, mobile-devices-inventory).',
          'Concevoir des extension attributes et scripts de politique pour remonter des signaux conformité custom.',
          'Chaîner politiques récurrentes, webhooks et exports planifiés pour alimenter SIEM ou Power BI.',
          'Appliquer une gouvernance API (scopes minimum, rotation token, rate limits) en production.',
          'Remédier à un incident de masse (apps VPP Pending, profils SCEP expirés) via Smart Group + API sans clics manuels.',
        ],
        keyTakeaways: [
          'L’API Jamf Pro v1 privilégie OAuth Bearer et filtres OData-like sur l’inventaire enrichi.',
          'Extension attributes + Smart Groups transforment des scripts locaux en critères de déploiement.',
          'Automatiser les exports avant un audit évite les CSV manuels et les erreurs de périmètre.',
          'Toute action API destructive (wipe, unmanage) exige garde-fous et compte de service dédié.',
        ],
        lessonContent: `## Automatisation et extension API Jamf Pro

Une fois les fondamentaux Smart Groups, inventaire et ADE maîtrisés, l’administrateur Jamf Pro passe à l’**industrialisation** : scripts récurrents, extension attributes calculés, appels API planifiés et webhooks qui alimentent la gouvernance sécurité sans multiplier les clics dans Jamf Admin. Ce module couvre les patterns utilisés sur des parcs de 200 à plusieurs milliers d’appareils Apple.

### Pourquoi automatiser Jamf Pro ?

Les tâches répétitives — export Mac non conformes OS, relance politique sur appareils stale, corrélation inventaire ABM vs Jamf — consomment des heures si elles restent manuelles. L’**API REST Jamf Pro** (developer.jamf.com) et les **politiques récurrentes** permettent de codifier ces runbooks. Objectifs typiques : réduire le temps de préparation audit ISO, accélérer remédiation post-incident PKI, et synchroniser Jamf avec CMDB ou Entra ID via middleware.

Documentation : [Jamf Pro API Overview](https://developer.jamf.com/jamf-pro/docs/jamf-pro-api-overview)

### Authentification OAuth et bonnes pratiques

Jamf Pro Cloud et les versions récentes On-Prem supportent **OAuth client credentials** : créez une API Client dans Settings → System → API Clients and Keys, assignez des scopes minimum (Read Computers, Read Mobile Devices, Update Mobile Device Commands selon besoin). Échangez client_id/client_secret contre un Bearer token via \`POST /api/oauth/token\`.

Ne stockez jamais le secret dans un script Git en clair : utilisez Azure Key Vault, HashiCorp Vault ou variables CI chiffrées. Rotation trimestrielle du client API. Compte de service dédié « automation-jamf » distinct des comptes admin humains — traçabilité audit.

### Endpoints inventaire modernes

Privilégiez **computers-inventory** et **mobile-devices-inventory** (API v1) plutôt que la Classic API \`/JSSResource/computers\` héritée. Exemple de filtre : appareils macOS 14+ avec dernière check-in > 7 jours :

\`GET /api/v1/computers-inventory?section=General&filter=general.lastReportedIp ne null and general.reportDate lt "2026-05-01"\`

Pour iPhone : \`mobile-devices-inventory\` expose supervision, osVersion, installedMobileApplications. Export JSON → script Python/Node → CSV Power BI. Planifiez via cron GitLab CI ou Azure Automation.

### Extension attributes et scripts avancés

Les **extension attributes (EA)** exécutent un script sur l’appareil au check-in et remontent une valeur texte dans l’inventaire. Cas d’usage : version agent EDR, statut patch mensuel, présence certificat client Wi-Fi dans Trousseau.

Bonnes pratiques EA :

- Scripts **légers** (< 5 s) pour ne pas ralentir check-in.
- Gestion d’erreur explicite (retourner « UNKNOWN » plutôt que vide).
- Smart Group « EA patch level != current » pour cibler politique corrective.

Combinez EA avec politique **Ongoing** exécutée quotidiennement sur Smart Group conformité — plus fiable qu’un one-shot oublié.

### Politiques récurrentes, webhooks et Self Service API

Les politiques Jamf déclenchées **Ongoing** avec fréquence (daily/weekly) maintiennent état désiré : purge caches, renouvellement certificat via script, reinstall agent si version < X. **Enrollment Complete** reste pour bootstrap ; **Ongoing** pour drift correction.

Jamf Pro supporte **webhooks** (Settings → Webhooks) notifiant un endpoint HTTPS lors d’événements (Smart Computer Group membership change, MDM command failure). Intégrez à Slack, ServiceNow ou SIEM.

Self Service peut déclencher politiques approuvées ; côté API, \`POST /api/v1/mdm/commands\` envoie InstallApplication, DeviceLock ou EraseDevice — **uniquement** via pipeline validé (change ticket, double approbation pour wipe).

### Cas pratique : 200 iPhone — apps VPP bloquées en Pending

Lundi matin, 45 iPhone d’un Smart Group « Retail Paris » affichent Teams VPP Pending dans Jamf. L’admin :

1. API : liste \`mobile-devices-inventory\` filtrée par Smart Group ID, extrait UDID concernés.
2. Vérifie licences VPP et token ABM — OK.
3. Correlèle avec ticket réseau : proxy bloque CDN Apple depuis vendredi.
4. Après ouverture flux réseau, envoie **RefreshMobileDevice** ou repush InstallApplication via API sur le Smart Group, pas 45 wipes.

Documente runbook : symptôme Pending massif + Safari OK → réseau avant MDM.

### Scripts macOS et politiques avancées

Sur Mac, politiques peuvent déployer **scripts bash/zsh** avec paramètres, exécution root, priorité Before/After autres actions. Pattern : script vérifie version agent → si obsolète, télécharge pkg interne. Logs dans /var/log/jamf.log — centralisez via SIEM si requis.

**FileVault escrow** et **Bootstrap Token** sur Apple Silicon Mac nécessitent politiques ordonnées ; testez sur Smart Group pilote avant API bulk trigger.

### Gouvernance, rate limits et sécurité API

Jamf Cloud applique rate limits ; batch vos requêtes (pagination 100–1000). Implémentez backoff exponentiel sur HTTP 429. Journalisez chaque appel automation (qui, quoi, combien d’appareils impactés).

Interdisez scripts ad hoc wipe depuis poste admin ; pipeline CI avec revue code. Séparez environnements labo vs production (JSS URL distinctes, tokens distincts).

### Reporting conformité automatisé

Pipeline hebdomadaire type :

1. Token OAuth → export inventaire Mac/iOS non conformes OS.
2. Join avec export ABM (appareils non assignés Jamf).
3. Email récap au CISO + création tickets Jira pour top 10 écarts.

Ce pattern remplace la capture d’écran manuelle avant comité mensuel.

> **Bonne pratique :** Versionnez vos scripts automation dans Git avec README (scopes API, owner, fréquence). Testez sur Smart Group « Labo » avant production. Référence : [Jamf Pro API](https://developer.jamf.com/jamf-pro/docs/jamf-pro-api-overview) et glossaire MDM (Smart Group, check-in, VPP).

### Limites et pièges fréquents

- Classic API vs v1 : mélanger les deux complique la maintenance — standardisez v1 pour inventaire.
- Token OAuth expiré en batch nocturne : alerte si job échoue deux nuits consécutives.
- Commande EraseDevice via API sans garde-fou : risque juridique — exiger approbation workflow.

En maîtrisant API, extension attributes et politiques récurrentes, vous transformez Jamf Pro en plateforme MDM programmable, prête pour parcs enterprise et audits exigeants.`,
        gameInstructions:
          'Ordonnez un runbook automation : token OAuth, export inventaire non conforme, ticket remédiation, puis repush politique sur Smart Group.',
      },
    },
  },
  'intune-ios-enrollment': {
    description: `Ce parcours s’adresse aux administrateurs Microsoft 365, aux ingénieurs endpoint et aux équipes sécurité qui déploient iPhone et iPad via Microsoft Intune. Vous configurerez l’enrôlement automatisé (ADE) depuis Apple Business Manager, construirez des politiques de conformité iOS/iPadOS, et protégerez les données Microsoft 365 avec App Protection Policies (MAM) et Conditional Access dans Entra ID.

L’objectif est de relier l’écosystème Apple (supervision, profils, ADE) aux exigences Zero Trust Microsoft : appareil conforme ou application approuvée avant accès aux données Exchange, Teams ou SharePoint. Chaque module inclut des liens vers Microsoft Learn et les guides Apple correspondants.

**Ce que vous saurez faire :** Déployer 200 iPhone supervisés via ABM et Intune avec profil ADE verrouillé ; créer des politiques de conformité iOS avec actions de wipe sélectif ou complet ; configurer App Protection et Conditional Access pour Outlook/Teams en BYOD ; renouveler jeton ABM et certificat Push Apple avant expiration ; et remédier aux appareils jailbreakés ou non conformes sans couper l'accès métier de toute la flotte.

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
          'Renouveler le jeton Enrollment Program Token Intune et resynchroniser ABM sans bloquer les appareils déjà inscrits.',
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
### Cas pratique : 200 iPhone corporate via ABM et Intune

Une entreprise finance déploie 200 iPhone 15 Pro via ABM vers Intune. Séquence : certificat Push Apple uploadé dans Intune, Enrollment Program Token synchronisé, appareils assignés au serveur Microsoft dans ABM, profil ADE créé (supervisé, locked enrollment, skip Apple ID personnel). Pilote : 5 iPhone → validation Managed, profils Wi-Fi/SCEP, apps VPP (Outlook, Authenticator).

Les numéros de série apparaissent sous 72 h après facturation revendeur. Sans assignation ABM → Intune, les iPhone démarrent en mode non géré malgré l'achat corporate.

### Renouvellement ADE tokens et certificat Push

Le **Enrollment Program Token** Intune expire typiquement après un an. Renouvelez depuis Intune → Devices → Apple enrollment → Enrollment Program Tokens, importez dans ABM. Les appareils déjà inscrits restent gérés ; seuls les nouveaux enrôlements ADE échouent si le token est expiré. Même logique pour le certificat MDM Push Apple (distinct du token ABM).

> **Bonne pratique :** Documentez dans un calendrier partagé les trois dates : Push cert, ABM token, renouvellement PKI SCEP. Testez le flux complet sur un iPhone de labo effacé avant la fenêtre de production. [Microsoft Learn — ADE](https://learn.microsoft.com/fr-fr/mem/intune/enrollment/device-enrollment-program-enroll-ios)

### Supervision et verrouillage MDM

Locked enrollment garantit que l'utilisateur ne peut pas retirer le profil MDM — prérequis des flottes Zero Trust. Supervision débloque restrictions avancées (App Store, AirDrop, comptes iCloud). Vérifiez Réglages → Général → Informations → Supervision sur le pilote avant vague de 200 appareils.

### Token vs Push : calendrier de renouvellement

Maintenez un tableau partagé avec trois dates critiques : certificat MDM Push Apple, Enrollment Program Token ABM, expiration PKI SCEP des profils Wi-Fi. Renouvelez chaque artefact 30 jours avant échéance et testez sur un iPhone de labo effacé. Microsoft Learn documente les chemins exacts dans le centre d'administration Intune sous Devices → Apple enrollment.



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
          'Configurer une action de non-conformité aboutissant à un effacement sélectif ou complet (wipe) sur iPhone compromis.',
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
### Cas pratique : conformité Intune sur 200 iPhone

Baseline Intune pour 200 iPhone corporate : iOS 17 minimum, PIN 6 chiffres, jailbreak = block immédiat, Threat level (Defender mobile) si licencié. Actions non-conformité : J+0 email, J+3 marquer non conforme, J+7 blocage CA Exchange/SharePoint, J+14 effacement sélectif (MAM) ou wipe device si hautement sensible.

Un iPhone jailbreaké détecté un lundi matin : pas de délai de grâce, ticket sécurité, retrait accès M365 via CA, option wipe complet si données classifiées.

### Intune compliance et wipe : niveaux d'action

Intune distingue **retire** (désinscription MDM + effacement selon paramètres), **selective wipe** (données MAM/apps gérées uniquement) et **full wipe** (effacement factory). Configurez progressivement : notification → non conforme → CA block → wipe. Le wipe complet sur appareil supervisé ADE le reprovisionne au prochain setup si toujours assigné ABM.

> **Bonne pratique :** Alignez hausse version OS minimale sur cycle Apple : communication J-14, grace period, puis enforcement CA. Helpdesk reçoit fiche remédiation standard. [Conformité iOS Intune](https://learn.microsoft.com/fr-fr/mem/intune/protect/device-compliance-get-started)

### Corrélation profils configuration et conformité

Un appareil peut avoir Wi-Fi déployé avec succès mais rester non conforme (PIN absent). Croisez rapports **Device configuration** et **Device compliance** dans Intune. Conditional Access ne reçoit le signal « compliant » que lorsque toutes les politiques assignées passent.

### Reporting Entra ID et preuve audit

Exportez mensuellement les appareils non conformes avec raison (OS, PIN, jailbreak). Archivez les captures Conditional Access sign-in logs montrant blocage 53003 pour appareils non conformes. Les auditeurs vérifient que jailbreak déclenche action < 24 h et que grace period OS est documentée par communication utilisateur datée. Conservez aussi l'historique complet des changements de baseline OS dans le ticket change management.



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
          'Combiner MAM, conformité device et Conditional Access pour un scénario COPE de 200 iPhone corporate.',
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
### Cas pratique : BYOD et COPE mixte — 200 utilisateurs

200 collaborateurs : 120 COPE (iPhone supervisés ADE Intune), 80 BYOD (MAM-only). COPE : conformité device + CA « require compliant device ». BYOD : App Protection Policy (PIN app, chiffrement, bloc copie) + CA « require app protection ». Outlook non managé doit échouer avec erreur 53003 dans Entra sign-in logs.

Pilote : 10 comptes de chaque modèle avant généralisation. Test copier-coller mail vers Notes personnel (doit échouer).

### Intune wipe sélectif vs conformité

Si un BYOD devient non conforme (jailbreak détecté via MAM/WIP), selective wipe efface données corporate dans Outlook/Teams sans effacer photos personnelles. Sur COPE, compliance policy peut déclencher full wipe après escalade sécurité — documentez la chaîne d'approbation.

> **Bonne pratique :** Préparez rollback CA : comptes pilote exclus, règle moins restrictive en parallèle, monitoring Entra ID Sign-ins filtré sur 53003. [Conditional Access overview](https://learn.microsoft.com/fr-fr/entra/identity/conditional-access/overview)

### PKI, SCEP et accès apps protégées

Les apps MAM accèdent au cloud via TLS ; l'accès réseau interne peut exiger certificat SCEP via profil Intune. Assurez cohérence certificat identité avant profil Wi-Fi 802.1X. Conditional Access évalue identité + app + device state à chaque session — un changement policy peut prendre 15–30 minutes à propager.

### Communication utilisateur BYOD/COPE

Préparez FAQ : pourquoi PIN Outlook séparé du code iPhone, pourquoi copier-coller vers Notes est bloqué, comment réenregistrer Company Portal. Pour 200 utilisateurs, envoyez email J-7 avant activation CA stricte avec lien vidéo 2 minutes. Réduisez tickets helpdesk en anticipant les erreurs 53003 les plus fréquentes. Incluez un canal Teams dédié « migration MAM » pendant toute la semaine de bascule production.



En combinant App Protection et Conditional Access, Intune sécurise M365 sur iOS même lorsque l’organisation ne possède pas entièrement l’appareil — pilier des déploiements hybrides Apple + Microsoft.`,
        gameInstructions:
          'Ordonnez le déploiement Outlook/Teams protégés : politique App Protection, Conditional Access, puis validation sur iPhone pilote.',
      },
      'vpp-abm-business-apps': {
        summary:
          'Connecter Apple Business Manager à Intune, synchroniser VPP et déployer apps métier, store et LOB sur iPhone/iPad supervisés.',
        learningObjectives: [
          'Lier le token VPP Apple (Apps and Books) à Intune et synchroniser le catalogue ABM.',
          'Assigner des apps VPP en mode device ou user et les pousser via Required vs Available.',
          'Diagnostiquer états Pending, Failed ou Missing sur apps iOS dans le portail Intune.',
          'Publier une app métier iOS (LOB) ou une app B2B privée avec certificat et profil géré.',
          'Coordonner renouvellement token VPP, certificat Push et profils SCEP avant déploiement de 200 iPhone.',
        ],
        keyTakeaways: [
          'Le token VPP ABM est distinct du certificat Push MDM et du Enrollment Program Token.',
          'Apps Required s’installent automatiquement ; Available passent par Company Portal ou App Store géré.',
          'Un échec massif d’installation pointe vers token VPP expiré, réseau ou licence insuffisante.',
          'Les apps LOB iOS exigent packaging .ipa signé et espace de stockage suffisant sur l’appareil.',
        ],
        lessonContent: `## Apps métier et Apple Business Manager dans Intune

Après ADE, conformité et App Protection, la dernière brique d’un déploiement iOS enterprise est le **catalogue applicatif** : Microsoft Teams, Outlook, apps métier internes et outils sectoriels distribués sans Apple ID personnel. Intune s’appuie sur **Apple Business Manager (ABM)** et le programme **VPP (Volume Purchase Program)** — aujourd’hui « Apps and Books » — pour assigner licences et pousser InstallApplication aux appareils supervisés.

### Architecture ABM → VPP → Intune

Trois artefacts distincts ne doivent pas être confondus :

1. **Certificat Apple MDM Push** — canal APNs pour commandes MDM temps réel.
2. **Enrollment Program Token** — synchronisation inventaire ABM et profils ADE.
3. **Token VPP (Apps and Books)** — téléchargé depuis Intune, importé dans ABM pour lier achats volume au tenant Microsoft.

Sans token VPP valide, Intune ne voit pas les apps achetées dans ABM ; les déploiements store échouent silencieusement ou restent en attente.

Documentation : [Apps iOS/iPadOS Intune](https://learn.microsoft.com/fr-fr/mem/intune/apps/apps-add) | [Apple Business Manager](https://support.apple.com/fr-fr/guide/apple-business-manager/)

### Synchroniser VPP dans le centre d’administration Intune

Chemin : **Apps → iOS/iPadOS → iOS/iPadOS apps → Add → App type Apple VPP**. Téléchargez le token depuis Intune (Tenant Administration → Connectors and tokens → Apple tokens), importez-le dans ABM sous **Preferences → MDM Server Assignment** ou section Apps and Books selon workflow.

Une fois synchronisé, les apps achetées (gratuites ou payantes) apparaissent dans Intune. Assignez licences **device** (flotte partagée, retail, éducation) ou **user** (Managed Apple ID, BYOD corporate avec compte).

Renouvelez le token VPP avant expiration — même discipline que Push cert et ADE token. Calendrier partagé IT recommandé.

### Required vs Available et expérience utilisateur

**Required** : Intune pousse l’app automatiquement aux appareils du groupe assigné — standard pour flotte 200 iPhone corporate identiques.

**Available** : l’utilisateur installe depuis **Company Portal** ou portail des apps — utile pour apps optionnelles ou BYOD.

**Uninstall on unenroll** : option pour retirer app si appareil sort du périmètre MDM — alignez avec politique RH et wipe.

Sur appareil **supervisé** ADE, Required évite tickets « je ne trouve pas l’app » ; vérifiez espace disque et réseau avant escalade.

### Apps store, B2B privées et LOB

**Store apps** : Teams, Authenticator, apps éditeur public — flux VPP standard.

**Apps B2B privées** : éditeur vous accorde accès via Apple Business Manager ; app invisible sur App Store public. Import dans ABM puis sync Intune.

**Line-of-business (LOB)** : package \`.ipa\` signé entreprise uploadé directement dans Intune. Taille limitée ; mise à jour manuelle ou pipeline CI signant nouvelle version. Testez sur iPhone pilote supervisé : installation, lancement, compatibilité iOS cible.

Ne distribuez jamais d’IPA non signé ou sideload ad hoc hors gouvernance — risque sécurité et rejet audit.

### Cas pratique : déploiement 200 iPhone finance

Entreprise finance : 200 iPhone 15 Pro supervisés ADE Intune. Catalogue : Outlook, Authenticator (Required), app trading B2B privée (Required), app RH Available via Company Portal.

Séquence admin :

1. Tokens Push, ADE et VPP validés.
2. Groupes dynamiques « iOS Corporate France ».
3. Apps assignées Required avec deadline 7 jours.
4. Pilote 10 iPhone : statut **Installed** dans Intune device install status.

Jour J production : 30 appareils restent **Pending install**. Triage :

- 25 sur même site → proxy bloque \`*.apple.com\` CDN — ticket réseau.
- 5 sans check-in 48 h → profil Wi-Fi SCEP expiré — repush profil certificat.

Pas de wipe massif. Corrélation **Monitor → App install status** par app et par groupe.

### Diagnostic Pending, Failed et Missing

Dans Intune : **Apps → Monitor → App install status**. Filtrez par app et groupe. Causes fréquentes :

| Symptôme | Piste |
|----------|-------|
| Pending prolongé | Réseau, proxy, espace disque, check-in stale |
| Failed | Licence VPP épuisée, app retirée ABM, incompatibilité iOS |
| Missing après wipe ADE | Délai normal 15–30 min post setup ; forcer sync |
| Échec global synchronisé | Token VPP expiré ou certificat Push |

Côté appareil : Réglages → Général → Gestion des appareils → profil MDM présent. Date/heure automatiques. Test LTE vs Wi-Fi corporate.

### Intune, Managed Apps et wipe sélectif

Les apps déployées via MDM sont **Managed Apps**. Lors d’un départ employé, **selective wipe** (MAM) ou retrait appareil efface données corporate dans Outlook/Teams ; apps VPP Required se réinstallent au prochain cycle si appareil reste inscrit.

Coordonnez avec conformité : appareil jailbreaké → wipe complet après approbation sécurité, pas simple repush app.

### PKI, Wi-Fi et prérequis réseau apps

Apps métier internes appellent souvent API backend via VPN ou Wi-Fi 802.1X. Déployez **profil SCEP** puis **Wi-Fi** avant apps LOB qui authentifient au réseau interne. Intune signale conflits profils dans Device configuration.

Conditional Access peut exiger appareil conforme **et** app protégée avant accès données — triple couche standard Zero Trust.

### Gouvernance catalogue et communication

Maintenez inventaire apps approuvées (nom, bundle ID, owner métier, mode Required/Available). Revue trimestrielle licences VPP : récupérez licences appareils restitués.

Communication utilisateurs : « Les apps entreprise s’installent automatiquement après configuration iPhone — laissez le Wi-Fi actif 30 minutes ». FAQ Company Portal réduit tickets helpdesk.

> **Bonne pratique :** Avant réception 200 appareils, validez triple token (Push, ADE, VPP), espace disque minimal 10 Go libre sur pilote, et flux réseau vers Apple CDN. Documentez bundle ID et version cible dans runbook. Glossaire : VPP, supervision, check-in MDM.

### Renouvellement et automatisation

Planifiez alertes 30 jours avant expiration token VPP. Script PowerShell Microsoft Graph ou export planifié app install status pour comité mensuel. Intune ne remplace pas CMDB — exportez vers ServiceNow si requis.

### Limites et pièges

- Confondre token VPP et Enrollment Program Token — deux imports ABM différents.
- Assigner app Required à groupe contenant appareils non supervisés — comportement divergent.
- Oublier compatibilité iOS minimum de l’app LOB après upgrade OS fleet-wide.

En maîtrisant ABM, VPP et déploiement apps Intune, vous complétez la chaîne Zero Trust Apple + Microsoft : appareil supervisé, conforme, protégé et équipé des applications métier sans friction utilisateur.`,
        gameInstructions:
          'Ordonnez le déploiement d’une app VPP Required sur 200 iPhone : tokens valides, assignation groupe, pilote, puis monitoring install status.',
      },
    },
  },
};

export function getCoursePedagogy(courseSlug: string): CoursePedagogy | undefined {
  return COURSE_PEDAGOGY[courseSlug];
}

/** Durée de lecture cumulée (~200 mots/min) pour un parcours MVP. */
export function getCourseReadingMinutes(courseSlug: string): number {
  const course = COURSE_PEDAGOGY[courseSlug];
  if (!course) return 0;
  return sumLessonReadingMinutes(Object.values(course.modules).map((module) => module.lessonContent));
}

export function getModulePedagogy(
  courseSlug: string,
  moduleSlug: string
): ModulePedagogy | undefined {
  return COURSE_PEDAGOGY[courseSlug]?.modules[moduleSlug];
}

export { countLessonWords } from './reading-time';

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
