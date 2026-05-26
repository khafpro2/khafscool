function parseCorsOrigin(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const origins = value.split(',').map((part) => part.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  mobileRedirectUri: process.env.MOBILE_REDIRECT_URI ?? 'applemdmacademy://auth',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  isDev: process.env.NODE_ENV !== 'production',
};

const PRODUCTION_REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CORS_ORIGIN',
] as const;

export function assertProductionSecrets() {
  if (!env.isDev) {
    const missing = PRODUCTION_REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
    if (missing.length > 0) {
      throw new Error(
        `Variables d'environnement manquantes en production : ${missing.join(', ')}. ` +
          'Renseignez-les dans le dashboard Render (ou Railway) puis redéployez.',
      );
    }
  }
}
