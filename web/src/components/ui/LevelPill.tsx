import { Badge } from './Badge';
import type { TrailLevel } from '@/lib/design';

interface LevelPillProps {
  level: TrailLevel;
  className?: string;
}

const LEVEL_META: Record<TrailLevel, { tone: 'success' | 'accent' | 'warning' }> = {
  Débutant: { tone: 'success' },
  Intermédiaire: { tone: 'accent' },
  Avancé: { tone: 'warning' },
};

export function LevelPill({ level, className }: LevelPillProps) {
  const meta = LEVEL_META[level];
  return (
    <Badge tone={meta.tone} className={className}>
      {level}
    </Badge>
  );
}
