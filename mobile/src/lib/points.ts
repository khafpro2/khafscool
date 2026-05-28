import { formatDateParis, getParisDayDiff } from '@ama/shared/locale';

export function formatActivityDate(value: string | Date | null | undefined) {
  if (!value) return 'Date inconnue';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';

  const now = new Date();
  const dayDiff = getParisDayDiff(date, now);

  if (dayDiff === 0) return "Aujourd'hui";
  if (dayDiff === 1) return 'Hier';
  if (dayDiff < 7) return `Il y a ${dayDiff} jours`;

  return formatDateParis(date, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
