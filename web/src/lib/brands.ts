export type BrandId = 'apple' | 'jamf' | 'microsoft';

export const BRAND_ARIA_LABELS: Record<BrandId, string> = {
  apple: 'Apple',
  jamf: 'Jamf',
  microsoft: 'Microsoft Intune',
};

/** Couleurs officielles (monochrome ou tuiles Microsoft). */
export const BRAND_COLORS: Record<BrandId, string> = {
  apple: '#1d1d1f',
  jamf: '#76B900',
  microsoft: '#0078D4',
};

export const MICROSOFT_TILE_COLORS = {
  red: '#F25022',
  green: '#7FBA00',
  blue: '#00A4EF',
  yellow: '#FFB900',
} as const;

export type BrandPath = { d: string; fill?: string };

/** Chemins SVG haute fidélité (Simple Icons / guidelines marque). */
export const BRAND_PATHS: Record<BrandId, BrandPath[]> = {
  apple: [
    {
      d: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.208.052-2.667.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
    },
  ],
  jamf: [
    {
      d: 'M10.658 0v23.997h2.632V12.63c0-5.976 4.703-10.812 10.527-10.812h.183V0H12.03C6.252 0 1.29 4.83.658 10.658H0v2.339h.658C1.29 18.825 6.252 23.655 12.03 23.655h11.97V21.04h-.183c-5.824 0-10.527-4.836-10.527-10.812V0H10.658z',
    },
  ],
  microsoft: [
    { d: 'M0 0h11.377v11.372H0z', fill: MICROSOFT_TILE_COLORS.red },
    { d: 'M12.623 0H24v11.372H12.623z', fill: MICROSOFT_TILE_COLORS.green },
    { d: 'M0 12.628h11.377V24H0z', fill: MICROSOFT_TILE_COLORS.blue },
    { d: 'M12.623 12.628H24V24H12.623z', fill: MICROSOFT_TILE_COLORS.yellow },
  ],
};

export const BRAND_VIEWBOX = '0 0 24 24';

export type BrandIconSize = 'sm' | 'md' | 'lg';

export const BRAND_SIZE_PX: Record<BrandIconSize, number> = {
  sm: 18,
  md: 28,
  lg: 44,
};

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

/** Remplissage : tuiles Microsoft fixes ; Jamf toujours vert officiel. */
export function resolveBrandPathFill(
  brand: BrandId,
  path: BrandPath,
  variant: 'default' | 'onColor',
): string {
  if (path.fill) return path.fill;
  if (brand === 'jamf') return 'var(--brand-jamf, #76B900)';
  if (variant === 'onColor') return '#ffffff';
  return BRAND_COLORS[brand];
}
