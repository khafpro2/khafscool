import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

function webHostFromEnv(): string | null {
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000';
  try {
    const host = new URL(webUrl).host;
    if (host.includes('localhost') || host.startsWith('127.')) return null;
    return host;
  } catch {
    return null;
  }
}

export default (): ExpoConfig => {
  const webHost = webHostFromEnv();
  const base = appJson.expo as ExpoConfig;

  return {
    ...base,
    ios: {
      ...base.ios,
      associatedDomains: webHost ? [`applinks:${webHost}`] : base.ios?.associatedDomains,
    },
    android: {
      ...base.android,
      intentFilters: webHost
        ? [
            {
              action: 'VIEW',
              autoVerify: true,
              category: ['BROWSABLE', 'DEFAULT'],
              data: [
                { scheme: 'https', host: webHost, pathPrefix: '/donate' },
                { scheme: 'https', host: webHost, pathPrefix: '/soutenir' },
              ],
            },
          ]
        : base.android?.intentFilters,
    },
  };
};
