import type { CSSProperties } from 'react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { getTrackBrand, getTrackVisual } from '@/lib/design';

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

export function TrackIcon({
  track,
  size = 'md',
  className,
  style,
  ariaHidden = true,
  title,
}: TrackIconProps) {
  const visual = getTrackVisual(track);
  const brand = visual.brand ?? getTrackBrand(track);
  const trackBrandClass =
    brand === 'jamf'
      ? 'track-icon-jamf'
      : brand === 'apple'
        ? 'track-icon-apple'
        : brand === 'microsoft'
          ? 'track-icon-microsoft'
          : null;
  const classes = [SIZE_CLASS[size], trackBrandClass, className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={{ background: visual.gradient, ...style }}
      aria-hidden={ariaHidden && Boolean(brand)}
      title={title}
    >
      {brand ? (
        <BrandIcon brand={brand} size={size} variant="onColor" />
      ) : (
        <span aria-hidden>{visual.icon}</span>
      )}
    </span>
  );
}
