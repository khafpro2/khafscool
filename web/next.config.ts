import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ama/shared'],
  async redirects() {
    return [
      // ── Anciens alias tarifaires ─────────────────────────────────────────
      {
        source: '/pricing',
        destination: '/courses',
        permanent: false,
      },

      // ── Alias français des routes de navigation ──────────────────────────
      {
        source: '/cours',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/parcours',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/parcours/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },
      {
        source: '/certifications',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/labs',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/quiz',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/examens',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/videos',
        destination: '/resources',
        permanent: true,
      },

      // ── Sous-routes /examens/:slug et /examens/:slug/result ──────────────
      // Le site marketing utilise /examens/{slug}/result → on redirige vers
      // la vraie page d'examen de l'app.
      {
        source: '/examens/:slug/result',
        destination: '/courses/:slug/examen',
        permanent: true,
      },
      {
        source: '/examens/:slug',
        destination: '/courses/:slug/examen',
        permanent: true,
      },

      // ── Mapping slugs marketing → slugs app ──────────────────────────────
      // Le site marketing utilise des slugs différents de ceux de l'app.
      // apple-it-professional, apple-fundamentals, apple-device-support → apple-cert-prep
      // apple-it-professional, apple-fundamentals, apple-device-support → apple-cert-prep
      // :path* préservé pour /examen, /revision, /certificate
      {
        source: '/courses/apple-it-professional/:path*',
        destination: '/courses/apple-cert-prep/:path*',
        permanent: true,
      },
      {
        source: '/courses/apple-it-professional',
        destination: '/courses/apple-cert-prep',
        permanent: true,
      },
      {
        source: '/courses/apple-fundamentals/:path*',
        destination: '/courses/apple-cert-prep/:path*',
        permanent: true,
      },
      {
        source: '/courses/apple-fundamentals',
        destination: '/courses/apple-cert-prep',
        permanent: true,
      },
      {
        source: '/courses/apple-device-support/:path*',
        destination: '/courses/apple-cert-prep/:path*',
        permanent: true,
      },
      {
        source: '/courses/apple-device-support',
        destination: '/courses/apple-cert-prep',
        permanent: true,
      },
      // jamf-100, jamf-170, jamf-200 → jamf-pro-foundations
      {
        source: '/courses/jamf-100/:path*',
        destination: '/courses/jamf-pro-foundations/:path*',
        permanent: true,
      },
      {
        source: '/courses/jamf-100',
        destination: '/courses/jamf-pro-foundations',
        permanent: true,
      },
      {
        source: '/courses/jamf-170/:path*',
        destination: '/courses/jamf-pro-foundations/:path*',
        permanent: true,
      },
      {
        source: '/courses/jamf-170',
        destination: '/courses/jamf-pro-foundations',
        permanent: true,
      },
      {
        source: '/courses/jamf-200/:path*',
        destination: '/courses/jamf-pro-foundations/:path*',
        permanent: true,
      },
      {
        source: '/courses/jamf-200',
        destination: '/courses/jamf-pro-foundations',
        permanent: true,
      },
      // intune-mac, intune-apple-advanced → intune-ios-enrollment
      {
        source: '/courses/intune-mac/:path*',
        destination: '/courses/intune-ios-enrollment/:path*',
        permanent: true,
      },
      {
        source: '/courses/intune-mac',
        destination: '/courses/intune-ios-enrollment',
        permanent: true,
      },
      {
        source: '/courses/intune-apple-advanced/:path*',
        destination: '/courses/intune-ios-enrollment/:path*',
        permanent: true,
      },
      {
        source: '/courses/intune-apple-advanced',
        destination: '/courses/intune-ios-enrollment',
        permanent: true,
      },


      // Slugs marketing supplémentaires → apple-cert-prep
      {
        source: '/courses/apple-device-management/:path*',
        destination: '/courses/apple-cert-prep/:path*',
        permanent: true,
      },
      {
        source: '/courses/apple-device-management',
        destination: '/courses/apple-cert-prep',
        permanent: true,
      },
      {
        source: '/courses/apple-enterprise/:path*',
        destination: '/courses/apple-cert-prep/:path*',
        permanent: true,
      },
      {
        source: '/courses/apple-enterprise',
        destination: '/courses/apple-cert-prep',
        permanent: true,
      },
      // Slugs marketing Jamf supplémentaires → jamf-pro-foundations
      {
        source: '/courses/jamf-300/:path*',
        destination: '/courses/jamf-pro-foundations/:path*',
        permanent: true,
      },
      {
        source: '/courses/jamf-300',
        destination: '/courses/jamf-pro-foundations',
        permanent: true,
      },
      {
        source: '/courses/jamf-pro-administration/:path*',
        destination: '/courses/jamf-pro-foundations/:path*',
        permanent: true,
      },
      {
        source: '/courses/jamf-pro-administration',
        destination: '/courses/jamf-pro-foundations',
        permanent: true,
      },
      // Slugs marketing Intune supplémentaires → intune-ios-enrollment
      {
        source: '/courses/intune-for-apple/:path*',
        destination: '/courses/intune-ios-enrollment/:path*',
        permanent: true,
      },
      {
        source: '/courses/intune-for-apple',
        destination: '/courses/intune-ios-enrollment',
        permanent: true,
      },
      {
        source: '/courses/microsoft-intune-apple/:path*',
        destination: '/courses/intune-ios-enrollment/:path*',
        permanent: true,
      },
      {
        source: '/courses/microsoft-intune-apple',
        destination: '/courses/intune-ios-enrollment',
        permanent: true,
      },

      // ── /cours/:slug (site marketing) → /courses/:slug ──────────────────
      {
        source: '/cours/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },

      // ── /certifications/:slug → /courses/:slug ───────────────────────────
      {
        source: '/certifications/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },

      // ── /labs/:slug → /courses/:slug ─────────────────────────────────────
      {
        source: '/labs/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },

      // ── /quiz/:slug → /courses/:slug ─────────────────────────────────────
      {
        source: '/quiz/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },

      // ── Alias anglais du footer ──────────────────────────────────────────
      {
        source: '/privacy',
        destination: '/legal/confidentialite',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/legal/conditions',
        permanent: true,
      },
      {
        source: '/legal',
        destination: '/legal/conditions',
        permanent: true,
      },

      // ── Pages utilitaires manquantes ─────────────────────────────────────
      {
        source: '/support',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/status',
        destination: '/diagnostics',
        permanent: false,
      },
      {
        source: '/enterprise',
        destination: '/about',
        permanent: false,
      },

      // ── Anciens liens auth ───────────────────────────────────────────────
      {
        source: '/auth/login',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/auth',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
