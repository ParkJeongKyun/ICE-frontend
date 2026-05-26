'use client';

import React, { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/locales/routing';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import USFlagIcon from '../common/Icons/USFlagIcon';
import KRFlagIcon from '../common/Icons/KRFlagIcon';
import HeartIcon from '../common/Icons/HeartIcon';
import CoffeeIcon from '../common/Icons/CoffeeIcon';
import IssueIcon from '../common/Icons/IssueIcon';
import {
  LangFlagBtn,
  LangFlagRow,
  SettingsButton,
  SettingsPanel,
  SettingsPanelTitle,
  SettingsSection,
  SettingsSectionLabel,
  SettingsWrapper,
  SettingsRow,
  SettingsLabel,
  ToggleTrack,
  ToggleThumb,
  ReportSection,
  ReportLink,
  SponsorLink,
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
  const tReport = useTranslations('report');
  const tSponsor = useTranslations('sponsor');
  const tCoffee = useTranslations('coffee');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isHashProcessing, isAnalysisProcessing } = useProcess();
  const { config, updateConfig, resetConfig } = useConfig();

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

  // 알람 설정 핸들러
  const handleToggleNotification = () => {
    updateConfig({
      notifications: {
        enabled: !config.notifications.enabled,
      },
    });
  };

  // 분석 설정 핸들러
  const handleToggleAnalysis = (key: 'enabled' | 'imageMetadata') => {
    updateConfig({
      analysis: {
        ...config.analysis,
        [key]: !config.analysis[key],
      },
    });
  };

  // UI 설정 핸들러
  const handleUIChange = (key: string, value: any) => {
    updateConfig({
      ui: {
        ...config.ui,
        [key]: value,
      },
    });
  };

  const ToggleSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <ToggleTrack
      $on={checked}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    >
      <ToggleThumb $on={checked} />
    </ToggleTrack>
  );

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

            {/* 알람 설정 */}
            <SettingsSection>
              <SettingsSectionLabel>
                {t('notifications.title')}
              </SettingsSectionLabel>
              <SettingsRow>
                <SettingsLabel>{t('notifications.enable')}</SettingsLabel>
                <ToggleSwitch
                  checked={config.notifications.enabled}
                  onChange={() => handleToggleNotification()}
                />
              </SettingsRow>
              <div
                style={{
                  marginLeft: '0px',
                  marginTop: '6px',
                  fontSize: '0.68rem',
                  color: 'var(--main-color)',
                  opacity: 0.7,
                  lineHeight: 1.4,
                }}
              >
                {t('notifications.note')}
              </div>
            </SettingsSection>

            {/* 분석 설정 */}
            <SettingsSection>
              <SettingsSectionLabel>{t('analysis.title')}</SettingsSectionLabel>
              <SettingsRow>
                <SettingsLabel>{t('analysis.enable')}</SettingsLabel>
                <ToggleSwitch
                  checked={config.analysis.enabled}
                  onChange={() => handleToggleAnalysis('enabled')}
                />
              </SettingsRow>
              {config.analysis.enabled && (
                <>
                  <SettingsRow style={{ marginLeft: '12px', opacity: 0.8 }}>
                    <SettingsLabel>{t('analysis.imageMetadata')}</SettingsLabel>
                    <ToggleSwitch
                      checked={config.analysis.imageMetadata}
                      onChange={() => handleToggleAnalysis('imageMetadata')}
                    />
                  </SettingsRow>
                </>
              )}
            </SettingsSection>

            {/* UI 설정 */}
            <SettingsSection>
              <SettingsSectionLabel>{t('ui.title')}</SettingsSectionLabel>
              <SettingsRow>
                <SettingsLabel>{t('ui.bytesPerLine')}</SettingsLabel>
                <select
                  value={config.ui.bytesPerLine}
                  onChange={(e) =>
                    handleUIChange('bytesPerLine', parseInt(e.target.value))
                  }
                  style={{
                    padding: '4px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--main-line-color)',
                    background: 'var(--main-bg-color)',
                    color: 'var(--main-color)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="8">8</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                </select>
              </SettingsRow>
              <SettingsRow>
                <SettingsLabel>{t('ui.numberBase')}</SettingsLabel>
                <select
                  value={config.ui.numberBase}
                  onChange={(e) => handleUIChange('numberBase', e.target.value)}
                  style={{
                    padding: '4px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--main-line-color)',
                    background: 'var(--main-bg-color)',
                    color: 'var(--main-color)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="binary">
                    {t('ui.numberBaseOptions.binary')}
                  </option>
                  <option value="octal">
                    {t('ui.numberBaseOptions.octal')}
                  </option>
                  <option value="decimal">
                    {t('ui.numberBaseOptions.decimal')}
                  </option>
                  <option value="hexadecimal">
                    {t('ui.numberBaseOptions.hexadecimal')}
                  </option>
                </select>
              </SettingsRow>
              <SettingsRow>
                <SettingsLabel>{t('ui.dateFormat')}</SettingsLabel>
                <select
                  value={config.ui.dateFormat}
                  onChange={(e) => handleUIChange('dateFormat', e.target.value)}
                  style={{
                    padding: '4px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--main-line-color)',
                    background: 'var(--main-bg-color)',
                    color: 'var(--main-color)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ISO">{t('ui.dateFormatOptions.ISO')}</option>
                  <option value="US">{t('ui.dateFormatOptions.US')}</option>
                  <option value="KO">{t('ui.dateFormatOptions.KO')}</option>
                </select>
              </SettingsRow>
            </SettingsSection>

            {/* 설정 초기화 */}
            <SettingsSection>
              <button
                onClick={resetConfig}
                disabled={isProcessing || isPending}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  border: '1px solid var(--main-line-color)',
                  background: 'transparent',
                  color: 'var(--main-color)',
                  fontSize: '0.75rem',
                  cursor: isProcessing || isPending ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || isPending ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {t('resetSettings')}
              </button>
            </SettingsSection>

            <ReportSection>
              <div
                style={{
                  fontSize: '0.68rem',
                  marginBottom: '4px',
                  color: 'var(--main-color)',
                  opacity: 0.85,
                  lineHeight: 1.4,
                }}
              >
                {t('languageHint')}
              </div>
              <ReportLink
                href={`${process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IssueIcon width={12} height={12} color="currentColor" />
                {tReport('description')}
              </ReportLink>
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <SponsorLink
                  href={process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HeartIcon width={12} height={12} color="currentColor" />
                  {tSponsor('button')}
                </SponsorLink>
                <SponsorLink
                  href={process.env.NEXT_PUBLIC_KOFI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CoffeeIcon width={12} height={12} color="currentColor" />
                  {tCoffee('description')}
                </SponsorLink>
              </div>
            </ReportSection>
          </SettingsPanel>
        </FloatingPortal>
      )}
    </SettingsWrapper>
  );
};

export default SettingsModal;
