import { formatDateParis, getParisDayDiff } from '@ama/shared/locale';

export function modulePointsFromScores(quizScore: number, gameScore: number) {
  return Math.round(quizScore * 0.1 + gameScore * 0.2);
}

export function scoreGameOrder(userOrder: number[], correctOrder: number[] | undefined) {
  if (!correctOrder?.length) return 0;
  let matches = 0;
  for (let index = 0; index < correctOrder.length; index += 1) {
    if (userOrder[index] === correctOrder[index]) matches += 1;
  }
  return Math.round((matches / correctOrder.length) * 100);
}

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
