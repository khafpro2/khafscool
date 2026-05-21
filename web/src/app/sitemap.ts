import type { MetadataRoute } from 'next';

const siteUrl = (process.env.WEB_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/courses',
  '/auth',
  '/quests',
  '/leaderboard',
  '/badges',
  '/sprint',
  '/resources',
  '/demo',
  '/diagnostics',
  '/legal/confidentialite',
  '/legal/conditions',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' || path === '/courses' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/courses' || path === '/about' ? 0.9 : 0.7,
  }));
}
