import { Badge } from './Badge';
import type { TrailLevel } from '@/lib/design';

interface LevelPillProps {
  level: TrailLevel;
  className?: string;
}

const LEVEL_META: Record<TrailLevel, { icon: string; tone: 'success' | 'accent' | 'warning' }> = {
  Débutant: { icon: '\u{1F331}', tone: 'success' },
  Intermédiaire: { icon: '\u{1F680}', tone: 'accent' },
  Avancé: { icon: '\u{1F525}', tone: 'warning' },
};

export function LevelPill({ level, className }: LevelPillProps) {
  const meta = LEVEL_META[level];
  return (
    <Badge tone={meta.tone} icon={meta.icon} className={className}>
      {level}
    </Badge>
  );
}
