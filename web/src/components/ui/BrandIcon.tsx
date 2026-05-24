import type { CSSProperties } from 'react';
import {
  BRAND_ARIA_LABELS,
  getBrandIconDimensions,
  getBrandPaths,
  getBrandViewBox,
  resolveBrandPathFill,
  type BrandId,
  type BrandIconSize,
  type BrandMark,
} from '@/lib/brands';

export type { BrandIconSize, BrandMark };

interface BrandIconProps {
  brand: BrandId;
  size?: BrandIconSize;
  /** Jamf : `symbol` (défaut) = icône seule ; `full` = logo + wordmark. */
  mark?: BrandMark;
  className?: string;
  style?: CSSProperties;
  /** Blanc sur fond coloré (Apple, Intune, Jamf). */
  variant?: 'default' | 'onColor';
}

export function BrandIcon({
  brand,
  size = 'md',
  mark = 'symbol',
  className,
  style,
  variant = 'default',
}: BrandIconProps) {
  const resolvedMark = brand === 'jamf' ? mark : 'full';
  const { width, height } = getBrandIconDimensions(brand, size, resolvedMark);
  const viewBox = getBrandViewBox(brand, resolvedMark);
  const paths = getBrandPaths(brand, resolvedMark);

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={BRAND_ARIA_LABELS[brand]}
      className={['brand-icon', `brand-icon-${brand}`, className].filter(Boolean).join(' ')}
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
