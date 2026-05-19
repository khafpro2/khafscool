import type { CSSProperties } from 'react';
import {
  BRAND_ARIA_LABELS,
  BRAND_PATHS,
  BRAND_SIZE_PX,
  BRAND_VIEWBOX,
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
  /** Blanc sur fond coloré (Apple, Intune). Jamf reste vert #76B900. */
  variant?: 'default' | 'onColor';
}

export function BrandIcon({
  brand,
  size = 'md',
  className,
  style,
  variant = 'default',
}: BrandIconProps) {
  const px = BRAND_SIZE_PX[size];
  const paths = BRAND_PATHS[brand];

  return (
    <svg
      width={px}
      height={px}
      viewBox={BRAND_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={BRAND_ARIA_LABELS[brand]}
      className={['brand-icon', className].filter(Boolean).join(' ')}
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
