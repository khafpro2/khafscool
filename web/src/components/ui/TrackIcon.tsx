import type { CSSProperties } from 'react';
import { getTrackVisual } from '@/lib/design';

interface TrackIconProps {
  track?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
  title?: string;
}

const SIZE_CLASS = {
  sm: 'track-icon track-icon-sm',
  md: 'track-icon',
  lg: 'track-icon track-icon-lg',
} as const;

export function TrackIcon({ track, size = 'md', className, style, ariaHidden = true, title }: TrackIconProps) {
  const visual = getTrackVisual(track);
  const classes = [SIZE_CLASS[size], className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      style={{ background: visual.gradient, ...style }}
      aria-hidden={ariaHidden}
      title={title}
    >
      {visual.icon}
    </span>
  );
}
