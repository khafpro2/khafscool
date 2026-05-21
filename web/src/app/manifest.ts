import type { MetadataRoute } from 'next';

const PRO_THEME = '#2563EB';
const PRO_BACKGROUND = '#f0f4ff';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MDM Academy Pro',
    short_name: 'MDM Academy',
    description:
      'Formation gamifiée gratuite : Apple Device Support, Jamf Pro et Microsoft Intune. Quiz, badges et sprints certification.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: PRO_BACKGROUND,
    theme_color: PRO_THEME,
    lang: 'fr',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
