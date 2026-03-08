'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/locales/routing';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import USFlagIcon from '../common/Icons/USFlagIcon';
import KRFlagIcon from '../common/Icons/KRFlagIcon';
import {
  LangFlagBtn,
  LangFlagRow,
  SettingsButton,
  SettingsPanel,
  SettingsPanelTitle,
  SettingsSection,
  SettingsSectionLabel,
  SettingsWrapper,
} from './SettingsModal.styles';

const SettingsIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SettingsModal: React.FC = () => {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isHashProcessing, isAnalysisProcessing } = useProcess();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isProcessing = isHashProcessing || isAnalysisProcessing;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLangSelect = (lang: 'ko' | 'en') => {
    if (isProcessing || lang === locale) return;
    localStorage.setItem('user-locale', lang);
    startTransition(() => {
      router.replace(pathname, { locale: lang });
    });
  };

  return (
    <SettingsWrapper ref={wrapperRef}>
      <SettingsButton
        onClick={() => setOpen((v) => !v)}
        aria-label={t('title')}
        aria-expanded={open}
        title={t('title')}
      >
        <SettingsIcon />
      </SettingsButton>

      {open && (
        <SettingsPanel>
          <SettingsPanelTitle>{t('title')}</SettingsPanelTitle>

          <SettingsSection>
            <SettingsSectionLabel>{t('language')}</SettingsSectionLabel>
            <LangFlagRow>
              <LangFlagBtn
                $active={locale === 'ko'}
                onClick={() => handleLangSelect('ko')}
                disabled={isProcessing || isPending}
                aria-label="한국어로 변경"
              >
                <KRFlagIcon width={20} height={14} />
                한국어
              </LangFlagBtn>
              <LangFlagBtn
                $active={locale === 'en'}
                onClick={() => handleLangSelect('en')}
                disabled={isProcessing || isPending}
                aria-label="Switch to English"
              >
                <USFlagIcon width={20} height={14} />
                English
              </LangFlagBtn>
            </LangFlagRow>
          </SettingsSection>
        </SettingsPanel>
      )}
    </SettingsWrapper>
  );
};

export default SettingsModal;
