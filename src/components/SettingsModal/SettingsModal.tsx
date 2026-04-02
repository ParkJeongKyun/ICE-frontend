'use client';

import React, { useState, useTransition } from 'react';
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
  ReportSection,
  ReportLink,
} from './SettingsModal.styles';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';

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
  const isProcessing = isHashProcessing || isAnalysisProcessing;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleLangSelect = (lang: 'ko' | 'en') => {
    if (isProcessing || lang === locale) return;
    localStorage.setItem('user-locale', lang);
    startTransition(() => {
      router.replace(pathname, { locale: lang });
    });
  };

  return (
    <SettingsWrapper>
      <Tooltip text={t('title')} placement="bottom" disabled={open}>
        <SettingsButton
          ref={refs.setReference}
          aria-label={t('title')}
          aria-expanded={open}
          {...getReferenceProps()}
        >
          <SettingsIcon />
        </SettingsButton>
      </Tooltip>

      {open && (
        <FloatingPortal>
          <SettingsPanel
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
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

            <ReportSection>
              <ReportLink
                href={`${process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </svg>
                {t('reportIssue')}
              </ReportLink>
              <ReportLink
                href={`${process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                </svg>
                {t('reportBug')}
              </ReportLink>
            </ReportSection>
          </SettingsPanel>
        </FloatingPortal>
      )}
    </SettingsWrapper>
  );
};

export default SettingsModal;
