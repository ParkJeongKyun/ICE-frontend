import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';
  const locales = ['en', 'ko'];
  const routes = ['', '/about', '/docs', '/linknote', '/privacy'];

  // 1. 다국어 경로 리스트 생성 (/en, /ko, /en/about 등)
  const sitemapList: MetadataRoute.Sitemap = routes.flatMap((route) => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'monthly',
      priority: route === '' ? 1.0 : route === '/docs' ? 0.9 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en${route}`,
          ko: `${baseUrl}/ko${route}`,
          // 하위 페이지들의 x-default는 기본적으로 /en 경로로 지정
          'x-default': route === '' ? baseUrl : `${baseUrl}/en${route}`,
        },
      },
    }));
  });

  // 2. ⭐️ 글로벌 대표 루트 URL (/) 명시적 추가
  sitemapList.unshift({
    url: baseUrl, // https://www.ice-forensic.com
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: {
      languages: {
        en: `${baseUrl}/en`,
        ko: `${baseUrl}/ko`,
        'x-default': baseUrl, // 루트 페이지의 x-default는 자기 자신
      },
    },
  });

  return sitemapList;
}
