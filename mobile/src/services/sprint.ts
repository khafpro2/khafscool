import { getAccessToken } from './auth';
import { apiFetch } from './api';

export type CertificationSprintTrack = 'APPLE' | 'JAMF' | 'INTUNE' | 'SERVICENOW';
export type CertificationSprintDays = 7 | 14;

export interface CertificationSprintSummary {
  id: string;
  questKey: string;
  track: CertificationSprintTrack;
  label: string;
  days: CertificationSprintDays;
  startedAt: string;
  endsAt: string;
  target: number;
  progress: number;
  progressPercent: number;
  remainingModules: number;
  completed: boolean;
  expired: boolean;
}

export interface CertificationSprintResult {
  data: CertificationSprintSummary | null;
  source: 'api' | 'demo';
}

export async function fetchCurrentCertificationSprint(): Promise<CertificationSprintResult> {
  const token = await getAccessToken();
  if (!token) return { data: mockCertificationSprint(), source: 'demo' };

  try {
    const data = await apiFetch<{ certificationSprint: CertificationSprintSummary | null }>(
      '/sprints/certification/current'
    );
    return { data: data.certificationSprint, source: 'api' };
  } catch {
    return { data: mockCertificationSprint(), source: 'demo' };
  }
}

export async function startCertificationSprint(payload: {
  track: CertificationSprintTrack;
  days: CertificationSprintDays;
}): Promise<CertificationSprintResult> {
  const token = await getAccessToken();
  if (!token) return { data: mockCertificationSprint(payload.track, payload.days), source: 'demo' };

  try {
    const data = await apiFetch<{ certificationSprint: CertificationSprintSummary }>(
      '/sprints/certification/start',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return { data: data.certificationSprint, source: 'api' };
  } catch {
    return { data: mockCertificationSprint(payload.track, payload.days), source: 'demo' };
  }
}

function mockCertificationSprint(
  track: CertificationSprintTrack = 'APPLE',
  days: CertificationSprintDays = 7
): CertificationSprintSummary {
  const startedAt = new Date();
  const endsAt = new Date(startedAt);
  endsAt.setDate(startedAt.getDate() + days);
  const target = track === 'SERVICENOW' ? 3 : 4;
  const progress = track === 'APPLE' ? 1 : 0;

  return {
    id: `demo-sprint-${track.toLowerCase()}`,
    questKey: `demo:sprint:${track}:${days}`,
    track,
    label: `Certification Sprint ${formatTrack(track)} - ${days} jours`,
    days,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    target,
    progress,
    progressPercent: Math.round((progress / target) * 100),
    remainingModules: Math.max(target - progress, 0),
    completed: progress >= target,
    expired: false,
  };
}

function formatTrack(track: CertificationSprintTrack) {
  const labels: Record<CertificationSprintTrack, string> = {
    APPLE: 'Apple',
    JAMF: 'Jamf',
    INTUNE: 'Intune',
    SERVICENOW: 'ServiceNow',
  };
  return labels[track];
}
