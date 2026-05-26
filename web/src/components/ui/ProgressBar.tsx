import type { CSSProperties } from 'react';

type ProgressTone = 'accent' | 'success' | 'warm';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  label?: string;
  showValueLabel?: boolean;
  className?: string;
  style?: CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const TONE_CLASS: Record<ProgressTone, string> = {
  accent: 'progress-bar',
  success: 'progress-bar progress-bar-success',
  warm: 'progress-bar progress-bar-warm',
};

export function ProgressBar({
  value,
  max = 100,
  tone = 'accent',
  label,
  showValueLabel = false,
  className,
  style,
  size = 'md',
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.max(0, Math.min(safeMax, value));
  const percent = Math.round((safeValue / safeMax) * 100);
  const height = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;

  return (
    <div className={className} style={style}>
      {(label || showValueLabel) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.85rem',
            marginBottom: '0.35rem',
            color: 'var(--muted)',
            fontWeight: 700,
          }}
        >
          {label && <span>{label}</span>}
          {showValueLabel && <span>{percent}%</span>}
        </div>
      )}
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height }}
      >
        <div className={TONE_CLASS[tone]} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
