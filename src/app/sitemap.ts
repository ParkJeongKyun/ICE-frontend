import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';
  const locales = ['en', 'ko'];
  const routes = ['', '/about', '/linknote'];

  const sitemapList = routes.flatMap((route) => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? ('daily' as const) : ('monthly' as const),
      // 메인(1.0) > 도구(0.9) > 소개(0.8) 순으로 우선순위 배분
      priority: route === '' ? 1.0 : route === '/linknote' ? 0.9 : 0.8,
    }));
  });

  return sitemapList;
}
