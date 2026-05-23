import type { MetadataRoute } from 'next';
import { MVP_TRACK_SLUGS } from '@ama/shared/learning-paths';

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
  '/resources/glossaire',
  '/demo',
  '/soutenir',
  '/soutenir/merci',
  '/soutenir/annule',
  '/diagnostics',
  '/legal/confidentialite',
  '/legal/conditions',
] as const;

const COURSE_SUBPATHS = ['revision', 'examen'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' || path === '/courses' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '/' ? 1 : path === '/courses' || path === '/about' ? 0.9 : 0.7,
  }));

  const courseSubEntries = MVP_TRACK_SLUGS.flatMap((slug) =>
    COURSE_SUBPATHS.map((subpath) => ({
      url: `${siteUrl}/courses/${slug}/${subpath}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  );

  return [...staticEntries, ...courseSubEntries];
}
