import type { MetadataRoute } from 'next';
import { MVP_TRACK_SLUGS } from '@ama/shared/learning-paths';

const siteUrl = (process.env.WEB_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

/** Pages publiques indexables avec leur priorité. */
const PUBLIC_PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, freq: 'weekly' },
  { path: '/courses', priority: 0.95, freq: 'weekly' },
  { path: '/about', priority: 0.8, freq: 'monthly' },
  { path: '/quests', priority: 0.75, freq: 'weekly' },
  { path: '/leaderboard', priority: 0.7, freq: 'weekly' },
  { path: '/badges', priority: 0.7, freq: 'monthly' },
  { path: '/sprint', priority: 0.75, freq: 'weekly' },
  { path: '/resources', priority: 0.7, freq: 'monthly' },
  { path: '/resources/glossaire', priority: 0.65, freq: 'monthly' },
  { path: '/demo', priority: 0.6, freq: 'monthly' },
  { path: '/soutenir', priority: 0.5, freq: 'monthly' },
  { path: '/legal/confidentialite', priority: 0.3, freq: 'yearly' },
  { path: '/legal/conditions', priority: 0.3, freq: 'yearly' },
];

const COURSE_SUBPATHS = ['revision', 'examen'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = PUBLIC_PATHS.map(({ path, priority, freq }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));

  // Pages de parcours individuels
  const courseDetailEntries = MVP_TRACK_SLUGS.map((slug) => ({
    url: `${siteUrl}/courses/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Sous-pages de chaque parcours (révision, examen blanc)
  const courseSubEntries = MVP_TRACK_SLUGS.flatMap((slug) =>
    COURSE_SUBPATHS.map((subpath) => ({
      url: `${siteUrl}/courses/${slug}/${subpath}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  );

  return [...staticEntries, ...courseDetailEntries, ...courseSubEntries];
}
