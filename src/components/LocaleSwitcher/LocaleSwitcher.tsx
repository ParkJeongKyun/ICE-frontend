'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/locales/routing';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import {
  LangFlagBtn,
  LangFlagRow,
} from '@/components/SettingsModal/SettingsModal.styles';

const LocaleSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (lang: 'ko' | 'en') => {
    if (lang === locale) return;
    localStorage.setItem('user-locale', lang);
    startTransition(() => {
      router.replace(pathname, { locale: lang });
    });
  };

  return (
    <LangFlagRow>
      <LangFlagBtn
        $active={locale === 'ko'}
        onClick={() => handleSelect('ko')}
        disabled={isPending}
        aria-label="한국어로 변경"
      >
        <KRFlagIcon width={18} height={13} />
        한국어
      </LangFlagBtn>
      <LangFlagBtn
        $active={locale === 'en'}
        onClick={() => handleSelect('en')}
        disabled={isPending}
        aria-label="Switch to English"
      >
        <USFlagIcon width={18} height={13} />
        English
      </LangFlagBtn>
    </LangFlagRow>
  );
};

export default LocaleSwitcher;
