import type { MetadataRoute } from 'next';

const siteUrl = (process.env.WEB_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/profile', '/mvp'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
