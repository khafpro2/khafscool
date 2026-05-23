export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: 'Apple' | 'Jamf' | 'Intune' | 'MDM' | 'Sécurité';
  related?: string[];
};

/** Glossaire MDM Apple — termes FR pour apprenants et techniciens. */
export const MDM_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'abm',
    term: 'ABM (Apple Business Manager)',
    definition:
      'Portail Apple pour centraliser l’achat d’appareils, les comptes administrateur et l’affectation des appareils à un serveur MDM. Successeur d’ASM pour les entreprises.',
    category: 'Apple',
    related: ['ade', 'dep', 'vpp'],
  },
  {
    id: 'ade',
    term: 'ADE (Automated Device Enrollment)',
    definition:
      'Enrôlement automatisé des appareils Apple via ABM/ASM : supervision obligatoire, profil MDM persistant et assistant de configuration verrouillé.',
    category: 'Apple',
    related: ['abm', 'dep', 'supervision'],
  },
  {
    id: 'dep',
    term: 'DEP (Device Enrollment Program)',
    definition:
      'Ancien nom du programme d’enrôlement automatisé Apple, remplacé par ADE. Encore cité dans la documentation legacy et certains consoles MDM.',
    category: 'Apple',
    related: ['ade', 'abm'],
  },
  {
    id: 'asm',
    term: 'ASM (Apple School Manager)',
    definition:
      'Équivalent ABM pour l’éducation : gestion des appareils, comptes élèves/enseignants et déploiement MDM dans les établissements.',
    category: 'Apple',
    related: ['abm', 'ade'],
  },
  {
    id: 'vpp',
    term: 'VPP (Volume Purchase Program)',
    definition:
      'Programme d’achat d’apps et de livres en volume via Apple Business Manager, distribués aux appareils gérés sans compte Apple personnel.',
    category: 'Apple',
    related: ['abm', 'managed-apple-id'],
  },
  {
    id: 'managed-apple-id',
    term: 'Managed Apple ID',
    definition:
      'Identifiant Apple créé et géré par l’organisation (ABM/ASM) pour les utilisateurs scolaires ou professionnels, distinct d’un Apple ID personnel.',
    category: 'Apple',
    related: ['abm', 'asm'],
  },
  {
    id: 'supervision',
    term: 'Supervision',
    definition:
      'Mode de gestion renforcée sur iOS/iPadOS/macOS/tvOS permettant des restrictions, profils non supprimables et commandes MDM avancées (ex. effacement sélectif).',
    category: 'Apple',
    related: ['ade', 'mdm', 'wipe-selectif'],
  },
  {
    id: 'mdm',
    term: 'MDM (Mobile Device Management)',
    definition:
      'Gestion à distance des appareils mobiles : inventaire, déploiement de profils, apps, politiques de sécurité et commandes (verrouillage, effacement, etc.).',
    category: 'MDM',
    related: ['profil-configuration', 'check-in'],
  },
  {
    id: 'profil-configuration',
    term: 'Profil de configuration',
    definition:
      'Fichier signé (.mobileconfig) déployé par le MDM contenant paramètres Wi-Fi, certificats, restrictions, VPN ou comptes.',
    category: 'MDM',
    related: ['scep', 'supervision'],
  },
  {
    id: 'scep',
    term: 'SCEP (Simple Certificate Enrollment Protocol)',
    definition:
      'Protocole d’émission automatique de certificats client sur appareils gérés, souvent couplé à une PKI d’entreprise pour Wi-Fi 802.1X ou VPN.',
    category: 'Sécurité',
    related: ['profil-configuration', 'pkce'],
  },
  {
    id: 'apns',
    term: 'APNs (Apple Push Notification service)',
    definition:
      'Canal push Apple utilisé par le serveur MDM pour réveiller les appareils et déclencher une synchronisation (check-in) sans polling permanent.',
    category: 'Apple',
    related: ['check-in', 'mdm'],
  },
  {
    id: 'check-in',
    term: 'Check-in MDM',
    definition:
      'Synchronisation entre l’appareil et le serveur MDM : inventaire, statut des profils, résultats de commandes et conformité.',
    category: 'MDM',
    related: ['apns', 'inventaire'],
  },
  {
    id: 'inventaire',
    term: 'Inventaire MDM',
    definition:
      'Collecte d’attributs appareil (modèle, OS, apps, certificats, Smart Groups) pour pilotage parc et audits de conformité.',
    category: 'MDM',
    related: ['smart-group', 'compliance'],
  },
  {
    id: 'smart-group',
    term: 'Smart Group',
    definition:
      'Groupe dynamique (Jamf, Intune ou autre MDM) dont l’appartenance est calculée par critères : OS, apps, localisation, conformité, etc.',
    category: 'Jamf',
    related: ['inventaire', 'politique'],
  },
  {
    id: 'politique',
    term: 'Politique MDM',
    definition:
      'Ensemble de règles et profils appliqués à un périmètre d’appareils ou d’utilisateurs : sécurité, apps, réseau, conformité.',
    category: 'MDM',
    related: ['profil-configuration', 'compliance'],
  },
  {
    id: 'compliance',
    term: 'Conformité (Compliance)',
    definition:
      'Évaluation automatique du respect des exigences (version OS, jailbreak, chiffrement, apps interdites) avec actions correctives ou blocage d’accès.',
    category: 'Sécurité',
    related: ['conditional-access', 'wipe-selectif'],
  },
  {
    id: 'wipe-selectif',
    term: 'Wipe sélectif (Erase Device)',
    definition:
      'Effacement à distance ciblé : données d’entreprise uniquement (Managed Apps) ou effacement complet selon supervision et politique.',
    category: 'Sécurité',
    related: ['supervision', 'compliance'],
  },
  {
    id: 'activation-lock',
    term: 'Activation Lock',
    definition:
      'Verrouillage anti-vol lié à Find My ; le retrait légitime passe par le propriétaire, ABM ou une commande MDM sur appareil supervisé.',
    category: 'Apple',
    related: ['find-my', 'abm'],
  },
  {
    id: 'find-my',
    term: 'Find My',
    definition:
      'Service Apple de localisation et verrouillage ; en entreprise, son état doit être documenté avant toute restauration ou recyclage parc.',
    category: 'Apple',
    related: ['activation-lock'],
  },
  {
    id: 'bootstrap-token',
    term: 'Bootstrap Token',
    definition:
      'Jeton macOS permettant au MDM d’obtenir un Secure Token et de gérer FileVault sans intervention manuelle de l’utilisateur local.',
    category: 'Apple',
    related: ['filevault', 'ade'],
  },
  {
    id: 'filevault',
    term: 'FileVault',
    definition:
      'Chiffrement intégral du disque macOS ; en contexte géré, clés de récupération escrowées vers le MDM pour support et conformité.',
    category: 'Sécurité',
    related: ['bootstrap-token', 'compliance'],
  },
  {
    id: 'conditional-access',
    term: 'Conditional Access',
    definition:
      'Politique Microsoft Entra ID exigeant appareil conforme Intune (ou hybride) avant accès aux ressources M365 ; complète la conformité MDM.',
    category: 'Intune',
    related: ['compliance', 'app-protection'],
  },
  {
    id: 'app-protection',
    term: 'App Protection Policy (MAM)',
    definition:
      'Politique Intune protégeant les données dans les apps (PIN, chiffrement, copier-coller) même sur appareil non entièrement géré.',
    category: 'Intune',
    related: ['conditional-access', 'compliance'],
  },
  {
    id: 'enrollment-profile',
    term: 'Profil d’enrôlement',
    definition:
      'Profil ADE ou manuel définissant supervision, MDM obligatoire et écrans Setup Assistant ; assigné depuis ABM au serveur MDM.',
    category: 'Apple',
    related: ['ade', 'abm'],
  },
  {
    id: 'remote-management',
    term: 'Remote Management',
    definition:
      'Écran affiché au premier démarrage d’un appareil ADE supervisé confirmant l’enrôlement MDM organisationnel.',
    category: 'Apple',
    related: ['ade', 'supervision'],
  },
  {
    id: 'jamf-pro',
    term: 'Jamf Pro',
    definition:
      'Console MDM Apple-native : smart groups, politiques, apps, inventaire et intégrations PKI/SCEP pour parcs macOS et iOS.',
    category: 'Jamf',
    related: ['smart-group', 'scep'],
  },
  {
    id: 'intune',
    term: 'Microsoft Intune',
    definition:
      'Service MEM pour gestion appareils Apple et Windows : ADE, conformité, apps, App Protection et intégration Entra ID.',
    category: 'Intune',
    related: ['conditional-access', 'ade'],
  },
  {
    id: 'mem',
    term: 'MEM (Microsoft Endpoint Manager)',
    definition:
      'Portail unifié regroupant Intune, Configuration Manager et fonctionnalités co-gestion pour le poste de travail moderne.',
    category: 'Intune',
    related: ['intune'],
  },
  {
    id: 'pkce',
    term: 'PKI / certificat MDM',
    definition:
      'Infrastructure à clés publiques émettant certificats appareil ou utilisateur ; le MDM automatise la distribution via SCEP ou profils.',
    category: 'Sécurité',
    related: ['scep', 'profil-configuration'],
  },
  {
    id: 'declarative-management',
    term: 'Declarative Device Management (DDM)',
    definition:
      'Modèle Apple où l’appareil applique des déclarations d’état (OS 15+) au lieu de commandes impératives classiques pour certains réglages.',
    category: 'Apple',
    related: ['mdm', 'supervision'],
  },
  {
    id: 'lost-mode',
    term: 'Mode Perdu (Lost Mode)',
    definition:
      'Commande MDM verrouillant l’appareil supervisé avec message personnalisé et suivi de localisation pour flottes d’entreprise.',
    category: 'MDM',
    related: ['supervision', 'mdm'],
  },
  {
    id: 'os-update',
    term: 'Gestion des mises à jour OS',
    definition:
      'Déploiement différé ou forcé des mises à jour iOS/macOS via MDM (Jamf, Intune) pour fenêtres de maintenance et conformité sécurité.',
    category: 'MDM',
    related: ['compliance', 'politique'],
  },
  {
    id: 'shared-ipad',
    term: 'Shared iPad',
    definition:
      'Mode iPad multi-utilisateurs en éducation ou retail ; nécessite Managed Apple ID et configuration MDM spécifique.',
    category: 'Apple',
    related: ['managed-apple-id', 'asm'],
  },
  {
    id: 'user-enrollment',
    term: 'User Enrollment',
    definition:
      'Enrôlement BYOD Apple séparant données perso et professionnelles ; restrictions MDM limitées par rapport à la supervision ADE.',
    category: 'Apple',
    related: ['supervision', 'mdm'],
  },
];

export function searchGlossary(query: string): GlossaryTerm[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return MDM_GLOSSARY;

  return MDM_GLOSSARY.filter((entry) => {
    const haystack = [entry.term, entry.definition, entry.category, ...(entry.related ?? [])].join(' ').toLowerCase();
    return haystack.includes(normalized);
  });
}
