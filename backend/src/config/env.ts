function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  mobileRedirectUri: process.env.MOBILE_REDIRECT_URI ?? 'applemdmacademy://auth',
  isDev: process.env.NODE_ENV !== 'production',
};

export function assertProductionSecrets() {
  if (!env.isDev) {
    required('JWT_SECRET');
    required('JWT_REFRESH_SECRET');
  }
}
