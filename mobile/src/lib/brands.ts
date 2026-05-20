export type BrandId = 'apple' | 'jamf' | 'microsoft';

export const BRAND_ARIA_LABELS: Record<BrandId, string> = {
  apple: 'Apple',
  jamf: 'Jamf',
  microsoft: 'Microsoft Intune',
};

/** Noir Apple (Human Interface Guidelines). */
export const APPLE_BLACK = '#1D1D1F';

/**
 * Vert Jamf officiel (media kit / guidelines partenaires).
 * #69BE28 est une variante legacy — on standardise sur #76B900.
 */
export const JAMF_GREEN = '#76B900';

export const BRAND_COLORS: Record<BrandId, string> = {
  apple: APPLE_BLACK,
  jamf: JAMF_GREEN,
  microsoft: '#0078D4',
};

/** Tuiles Microsoft (logo 4 carrés). */
export const MICROSOFT_TILE_COLORS = {
  red: '#F25022',
  green: '#7FBA00',
  blue: '#00A4EF',
  yellow: '#FFB900',
} as const;

export type BrandPath = { d: string; fill?: string };

/** viewBox carré 24×24 (Apple, Microsoft). */
export const BRAND_SQUARE_VIEWBOX = '0 0 24 24';

/**
 * Chemins SVG haute fidélité.
 * Apple / Microsoft : Simple Icons v11 (simpleicons.org).
 * Jamf : wordmark officiel (jamf.com media kit).
 */
export const BRAND_PATHS: Record<BrandId, BrandPath[]> = {
  apple: [
    {
      d: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
    },
  ],
  jamf: [
    {
      d: 'M91.5 26.3c0-4.3-4.3-5.3-7.7-5.3-2.4 0-4.7.6-7.1 1.8L74.6 19c3.9-1.7 7-2 9.3-2 6.2 0 12 2.7 12 8.9v17.8h-4.2v-2.8c-2.3 2.4-4.8 3.4-8.2 3.4-6.3 0-11.3-3.6-11.3-9.4 0-4.8 4-9 11.2-9 2.7 0 5.6.8 8 3v-2.6zM84.3 30c-5.5 0-7.3 2.7-7.3 5.2 0 2.6 1.8 5.2 7.3 5.2s7.3-2.7 7.3-5.2c0-2.6-1.8-5.2-7.3-5.2zM138.6 27.8c0-4.5-2.6-6.5-5.7-6.5-3.7 0-6.5 2.4-6.5 6.7v15.8h-4.5v-16c0-4.5-2.6-6.5-5.7-6.5-3.7 0-6.5 2.4-6.5 6.7v15.8h-4.5V17.6h4.5v3.1h.1c1.2-2.7 4.4-3.7 7.1-3.7 2.6 0 5.5.7 7.6 4.5 1.6-3.3 5-4.5 8.4-4.5 5.6 0 9.9 3.4 9.9 10.2v16.5h-4.5V27.8zM154.1 13.7c0-5.5 3.7-8.1 8.9-8.3v4.5h-1c-2.3 0-3.5 1.9-3.5 4.2v3.6h4.2v4h-4.2v22.2H154V21.6h-3.9v-4h3.9v-3.9zM61 17.5h4.5l.1 29.5c0 6.8-4.4 9.1-9.3 9.1h-1.6v-4.2h1.7c4.4 0 4.8-2.4 4.8-4.7L61 17.5zm2.1-11.4c1.7 0 3.1 1.4 3.1 3.1 0 1.8-1.4 3.2-3.1 3.2-1.7 0-3.1-1.4-3.1-3.1s1.4-3.2 3.1-3.2z',
    },
    {
      d: 'M3 .8C1.7.8.6 1.9.7 3.3v16.3c0 1.3 1.1 2.3 2.4 2.3h8.2c3.8 0 8.9-.8 10.3-7.5 0 0 1.4-6.7 2.2-10.7.3-1.5-.8-2.9-2.3-2.8H3z',
    },
    {
      d: 'M34.5 8.4c-5.5 0-8.8 2.4-10.3 7.4l-3.8 12c-1.4 3.9-3.7 5.6-7.8 5.6H2.9c-1.2 0-2.2 1-2.2 2.2v6.1c0 1.2 1 2.1 2.1 2.1h38.9c1.2 0 2.2-1.2 2.2-2.4V10.5c0-1.2-1.1-2.1-2.3-2.1h-7.1z',
    },
  ],
  microsoft: [
    { d: 'M0 0h11.408v11.408H0z', fill: MICROSOFT_TILE_COLORS.red },
    { d: 'M12.594 0H24v11.408H12.594z', fill: MICROSOFT_TILE_COLORS.green },
    { d: 'M0 12.594h11.408V24H0z', fill: MICROSOFT_TILE_COLORS.blue },
    { d: 'M12.594 12.594H24V24H12.594z', fill: MICROSOFT_TILE_COLORS.yellow },
  ],
};

export type BrandIconSize = 'sm' | 'md' | 'lg';

export const BRAND_SIZE_PX: Record<BrandIconSize, number> = {
  sm: 18,
  md: 28,
  lg: 44,
};

export const BRAND_VIEWBOXES: Record<BrandId, string> = {
  apple: BRAND_SQUARE_VIEWBOX,
  jamf: '0 0 163.6 56.9',
  microsoft: BRAND_SQUARE_VIEWBOX,
};

const BRAND_ASPECT_RATIO: Record<BrandId, number> = {
  apple: 1,
  jamf: 163.6 / 56.9,
  microsoft: 1,
};

export function getBrandViewBox(brand: BrandId): string {
  return BRAND_VIEWBOXES[brand];
}

export function getBrandIconDimensions(
  brand: BrandId,
  size: BrandIconSize,
): { width: number; height: number } {
  const px = BRAND_SIZE_PX[size];
  const aspect = BRAND_ASPECT_RATIO[brand];
  if (aspect <= 1) {
    return { width: px, height: px };
  }
  return { width: Math.round(px * aspect), height: px };
}

const TRACK_BRAND: Record<string, BrandId> = {
  APPLE: 'apple',
  JAMF: 'jamf',
  INTUNE: 'microsoft',
};

const BADGE_BRAND: Record<string, BrandId> = {
  'apple-mdm-foundation': 'apple',
  'jamf-engineer': 'jamf',
  'intune-professional': 'microsoft',
};

export function getTrackBrand(track?: string | null): BrandId | undefined {
  if (!track) return undefined;
  return TRACK_BRAND[track.toUpperCase()];
}

export function getBadgeBrand(slug: string): BrandId | undefined {
  return BADGE_BRAND[slug];
}

export function resolveBrandPathFill(
  brand: BrandId,
  path: BrandPath,
  variant: 'default' | 'onColor',
): string {
  if (path.fill) return path.fill;
  if (variant === 'onColor') return '#ffffff';
  return BRAND_COLORS[brand];
}
