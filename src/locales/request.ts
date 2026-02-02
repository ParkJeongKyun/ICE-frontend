import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 정적 export에서는 requestLocale 등 런타임 요청 정보를 사용할 수 없음
// 오직 빌드 타임에 locale이 결정되어야 함
export default getRequestConfig(async ({ locale }) => {
  // locale은 [locale] segment에서 추출됨
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      ...(await import(`../locales/${locale}/translation.json`)).default,
      messages: (await import(`../locales/${locale}/messages/messages.json`))
        .default,
      exifTags: (await import(`../locales/${locale}/exifTags/exifTags.json`))
        .default,
      exifExamples: (
        await import(`../locales/${locale}/exifExamples/exifExamples.json`)
      ).default,
      linknote: (await import(`../locales/${locale}/linknote/linknote.json`))
        .default,
    },
  };
});
