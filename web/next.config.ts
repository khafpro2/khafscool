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
      // La nav et le footer du site marketing utilisent ces URLs françaises.
      // On les redirige vers les vraies routes de l'application.
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
