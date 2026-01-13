import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import ko from './locales/ko/translation.json';
import enMessages from './locales/en/messages/messages.json';
import koMessages from './locales/ko/messages/messages.json';

i18n


const resources = {
  en: { translation: en, messages: enMessages },
  ko: { translation: ko, messages: koMessages },
};
type Lang = keyof typeof resources;

function detectLang(): Lang {
  // 1. 사용자가 이전에 선택한 언어 확인 (localStorage)
  const saved = typeof window !== 'undefined' && window.localStorage?.getItem('lang');
  if (saved && (saved === 'en' || saved === 'ko')) return saved as Lang;
  
  // 2. 브라우저/시스템 언어 감지
  if (typeof navigator !== 'undefined') {
    const browserLangs = navigator.languages || [navigator.language];
    for (const langCode of browserLangs) {
      const code = langCode.split('-')[0].toLowerCase();
      if (code === 'en' || code === 'ko') return code as Lang;
    }
  }
  
  // 3. 기본값: 영어
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLang(),
    fallbackLng: 'en',
    ns: ['translation', 'messages'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // react는 XSS 방지 자동 처리
    },
    supportedLngs: ['en', 'ko'],
    detection: {
      // i18next-browser-languagedetector를 쓰지 않고 직접 처리
    },
  });

// 언어 변경 시 localStorage/cookie에 저장
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('lang', lng);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
