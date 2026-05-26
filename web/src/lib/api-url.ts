const LOCAL_DEV_API_URL = 'http://127.0.0.1:4000';

function readConfiguredApiUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value || undefined;
}

/** URL backend pour le proxy serveur et les appels SSR. */
export function resolveApiUrl(): string {
  const configured = readConfiguredApiUrl();
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') return '';
  return LOCAL_DEV_API_URL;
}

export const API_URL = resolveApiUrl();

export const IS_API_URL_CONFIGURED = Boolean(readConfiguredApiUrl());

/** Libellé affiché dans l’UI (jamais localhost en prod si la variable est absente). */
export const API_URL_DISPLAY = IS_API_URL_CONFIGURED
  ? readConfiguredApiUrl()!
  : process.env.NODE_ENV === 'production'
    ? 'NEXT_PUBLIC_API_URL non définie (rebuild Vercel requis)'
    : LOCAL_DEV_API_URL;

/** Chemin API côté navigateur (proxy BFF) ou URL directe côté serveur. */
export function resolveClientApiPath(path: string): string {
  if (typeof window !== 'undefined') return `/api/proxy${path}`;
  return `${API_URL}${path}`;
}
