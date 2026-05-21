export function modulePointsFromScores(quizScore: number, gameScore: number) {
  return Math.round(quizScore * 0.1 + gameScore * 0.2);
}

export function formatActivityDate(value: string | Date | null | undefined) {
  if (!value) return 'Date inconnue';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfActivity = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfActivity.getTime()) / 86_400_000);

  if (dayDiff === 0) return "Aujourd'hui";
  if (dayDiff === 1) return 'Hier';
  if (dayDiff < 7) return `Il y a ${dayDiff} jours`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
