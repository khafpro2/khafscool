export const LEARNING_PATHS = [
  {
    slug: 'apple-cert-prep',
    track: 'APPLE',
    brand: 'apple' as const,
    title: 'Parcours Apple — Device Support & MDM',
    shortTitle: 'Apple Device Support',
    durationMinutes: 45,
    totalModules: 3,
    objectives: [
      'Diagnostiquer pannes sur Mac, iPhone et iPad',
      'Sécuriser sauvegardes et restaurations',
      'Préparer l’examen Apple Device Support',
    ],
  },
  {
    slug: 'jamf-pro-foundations',
    track: 'JAMF',
    brand: 'jamf' as const,
    title: 'Fondamentaux Jamf Pro',
    shortTitle: 'Jamf Pro',
    durationMinutes: 45,
    totalModules: 3,
    objectives: [
      'Smart groups et politiques pilotes',
      'Inventaire et conformité Jamf',
      'Enrôlement via Apple Business Manager',
    ],
  },
  {
    slug: 'intune-ios-enrollment',
    track: 'INTUNE',
    brand: 'microsoft' as const,
    title: 'Microsoft Intune — Enrôlement iOS/iPadOS',
    shortTitle: 'Microsoft Intune',
    durationMinutes: 45,
    totalModules: 3,
    objectives: [
      'Enrôlement automatisé (ADE) iOS/iPadOS',
      'Politiques de conformité Intune',
      'App Protection et Conditional Access',
    ],
  },
] as const;
