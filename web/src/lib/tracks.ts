const trackLabels: Record<string, string> = {
  APPLE: 'Apple',
  JAMF: 'Jamf',
  INTUNE: 'Intune',
  SERVICENOW: 'ServiceNow',
  SERVICENOW_GAME: 'ServiceNow',
  RESOURCES: 'Ressources',
  SPRINT: 'Sprint',
};

export function formatTrack(track: string) {
  return trackLabels[track] ?? track;
}
