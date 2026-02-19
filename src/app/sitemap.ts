import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';
  const locales = ['en', 'ko'];
  const routes = ['', '/about', '/docs', '/linknote', '/privacy'];

  const sitemapList = routes.flatMap((route) => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? ('daily' as const) : ('monthly' as const),
      priority: route === '' ? 1.0 : route === '/docs' ? 0.9 : 0.8,
    }));
  });

  return sitemapList;
}
