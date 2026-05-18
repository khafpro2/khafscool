const trackLabels: Record<string, string> = {
  APPLE: 'Apple Device Support',
  JAMF: 'Jamf Pro',
  INTUNE: 'Microsoft Intune',
  RESOURCES: 'Ressources',
  SPRINT: 'Sprint',
};

const badgeLabels: Record<string, string> = {
  'apple-mdm-foundation': 'Fondamentaux Apple MDM',
  'jamf-engineer': 'Ingénieur Jamf',
  'intune-professional': 'Professionnel Intune',
};

export function formatTrack(track: string) {
  return trackLabels[track] ?? track;
}

export function formatBadge(badge: string) {
  return (
    badgeLabels[badge] ??
    badge
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}
