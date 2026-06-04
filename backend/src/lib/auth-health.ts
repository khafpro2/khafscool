import { signAccessToken, verifyAccessToken } from '../services/token.service.js';

const DEV_ACCESS_DEFAULT = 'dev-access-secret-change-in-production';
const DEV_REFRESH_DEFAULT = 'dev-refresh-secret-change-in-production';

const WEAK_SECRET_MARKERS = [
  'change-me-access-secret',
  'change-me-refresh-secret',
  'dev-access-secret',
  'dev-refresh-secret',
] as const;

export type AuthHealthResponse = {
  status: 'ok' | 'warning' | 'error';
  message: string;
  environment: 'development' | 'production';
  jwtAccessConfigured: boolean;
  jwtRefreshConfigured: boolean;
  corsConfigured: boolean;
  jwtRoundTripOk: boolean;
};

function isProductionRuntime(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.RAILWAY_ENVIRONMENT?.trim().toLowerCase() === 'production';
}

function isStrongSecret(value: string | undefined, devDefault: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === devDefault || trimmed.length < 32) return false;
  const lower = trimmed.toLowerCase();
  return !WEAK_SECRET_MARKERS.some((marker) => lower.includes(marker));
}

function verifyJwtRoundTrip(): boolean {
  try {
    const token = signAccessToken({ sub: 'auth-health-check', email: null });
    const payload = verifyAccessToken(token);
    return payload.sub === 'auth-health-check';
  } catch {
    return false;
  }
}

export function getAuthHealth(): AuthHealthResponse {
  const environment: AuthHealthResponse['environment'] = isProductionRuntime()
    ? 'production'
    : 'development';
  const jwtAccessConfigured = isStrongSecret(process.env.JWT_SECRET, DEV_ACCESS_DEFAULT);
  const jwtRefreshConfigured = isStrongSecret(process.env.JWT_REFRESH_SECRET, DEV_REFRESH_DEFAULT);
  const corsConfigured = Boolean(process.env.CORS_ORIGIN?.trim());
  const jwtRoundTripOk = verifyJwtRoundTrip();

  const base = {
    environment,
    jwtAccessConfigured,
    jwtRefreshConfigured,
    corsConfigured,
    jwtRoundTripOk,
  };

  if (!jwtRoundTripOk) {
    return {
      ...base,
      status: 'error',
      message: 'Échec signature/vérification JWT access — contrôle JWT_SECRET.',
    };
  }

  if (environment === 'production') {
    const missing: string[] = [];
    if (!jwtAccessConfigured) missing.push('JWT_SECRET');
    if (!jwtRefreshConfigured) missing.push('JWT_REFRESH_SECRET');
    if (!corsConfigured) missing.push('CORS_ORIGIN');

    if (missing.length > 0) {
      return {
        ...base,
        status: 'error',
        message: `Production : variables manquantes ou faibles (${missing.join(', ')}). Voir DEPLOYMENT.md.`,
      };
    }

    return {
      ...base,
      status: 'ok',
      message: 'JWT access opérationnel — secrets prod et CORS_ORIGIN configurés.',
    };
  }

  if (!jwtAccessConfigured || !jwtRefreshConfigured) {
    return {
      ...base,
      status: 'warning',
      message:
        'Dev — secrets JWT par défaut (OK en local). Définir JWT_SECRET et JWT_REFRESH_SECRET avant la prod.',
    };
  }

  if (!corsConfigured) {
    return {
      ...base,
      status: 'warning',
      message: 'Dev — CORS_ORIGIN vide (toutes origines). Recommandé en prod : URL Vercel exacte.',
    };
  }

  return {
    ...base,
    status: 'ok',
    message: 'Auth JWT opérationnel (environnement dev).',
  };
}
