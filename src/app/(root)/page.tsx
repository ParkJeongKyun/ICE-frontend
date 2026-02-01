// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const supportedLocales = ['ko', 'en'];
    const defaultLocale = 'en';

    // 1단계: LocalStorage에 저장된 언어가 있는지 확인 (재방문 사용자)
    // 'user-locale'은 임의의 키 이름입니다. 언어 변경 시 이 키로 저장해야 합니다.
    const savedLang = localStorage.getItem('user-locale');

    if (savedLang && supportedLocales.includes(savedLang)) {
      router.replace(`/${savedLang}`);
      return; // 로직 종료
    }

    // 2단계: 브라우저 언어 감지 (신규 사용자)
    const browserLangRaw = navigator.language || navigator.languages?.[0];
    const browserLang = browserLangRaw
      ? browserLangRaw.split('-')[0]
      : defaultLocale;

    // 3단계: 지원하는 언어인지 확인 후 리다이렉트
    if (supportedLocales.includes(browserLang)) {
      router.replace(`/${browserLang}`);
    } else {
      router.replace(`/${defaultLocale}`);
    }
  }, [router]);

  return null;
}
