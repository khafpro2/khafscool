import type { CSSProperties } from 'react';
import {
  BRAND_ARIA_LABELS,
  BRAND_PATHS,
  getBrandIconDimensions,
  getBrandViewBox,
  resolveBrandPathFill,
  type BrandId,
  type BrandIconSize,
} from '@/lib/brands';

export type { BrandIconSize };

interface BrandIconProps {
  brand: BrandId;
  size?: BrandIconSize;
  className?: string;
  style?: CSSProperties;
  /** Blanc sur fond coloré (Apple, Intune, Jamf). */
  variant?: 'default' | 'onColor';
}

export function BrandIcon({
  brand,
  size = 'md',
  className,
  style,
  variant = 'default',
}: BrandIconProps) {
  const { width, height } = getBrandIconDimensions(brand, size);
  const viewBox = getBrandViewBox(brand);
  const paths = BRAND_PATHS[brand];

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={BRAND_ARIA_LABELS[brand]}
      className={['brand-icon', brand === 'jamf' ? 'brand-icon-jamf' : null, className]
        .filter(Boolean)
        .join(' ')}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill={resolveBrandPathFill(brand, path, variant)}
        />
      ))}
    </svg>
  );
}
