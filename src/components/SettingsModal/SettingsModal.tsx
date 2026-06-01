'use client';

import React, { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/locales/routing';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { encodingOptions } from '@/components/HexViewer/hexViewerConstants';
import USFlagIcon from '../common/Icons/USFlagIcon';
import KRFlagIcon from '../common/Icons/KRFlagIcon';
import HeartIcon from '../common/Icons/HeartIcon';
import CoffeeIcon from '../common/Icons/CoffeeIcon';
import IssueIcon from '../common/Icons/IssueIcon';
import XIcon from '../common/Icons/XIcon';
import {
  LangFlagBtn,
  LangFlagRow,
  SettingsButton,
  SettingsPanel,
  SettingsHeader,
  SettingsTitle,
  CloseBtn,
  SettingsContent,
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
  SelectWrapper,
  StyledSelect,
  SettingsGrid,
  ResetButton,
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
  FloatingOverlay,
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
  const tCommon = useTranslations('common');
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

  const handleToggleNotification = () => {
    updateConfig({
      notifications: {
        enabled: !config.notifications.enabled,
      },
    });
  };

  const handleToggleAnalysis = (
    key: 'enabled' | 'imageMetadata' | 'locationTracking'
  ) => {
    updateConfig({
      analysis: {
        ...config.analysis,
        [key]: !config.analysis[key],
      },
    });
  };

  const handleUIChange = (key: string, value: any) => {
    updateConfig({
      ui: {
        ...config.ui,
        [key]: value,
      },
    });
  };

  const handlePanelVisibilityChange = (
    panel: 'info' | 'tools',
    subKey: string
  ) => {
    const currentPanel = config.ui.panelVisibility[panel];
    updateConfig({
      ui: {
        ...config.ui,
        panelVisibility: {
          ...config.ui.panelVisibility,
          [panel]: {
            ...currentPanel,
            [subKey]: !currentPanel[subKey as keyof typeof currentPanel],
          },
        },
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
          <FloatingOverlay
            lockScroll
            style={{
              zIndex: 1100,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <SettingsPanel ref={refs.setFloating} {...getFloatingProps()}>
              <SettingsHeader>
                <SettingsTitle>{t('title')}</SettingsTitle>
                <Tooltip text={tCommon('close')}>
                  <CloseBtn
                    onClick={() => setOpen(false)}
                    aria-label={tCommon('close')}
                  >
                    <XIcon width={14} height={14} />
                  </CloseBtn>
                </Tooltip>
              </SettingsHeader>

              <SettingsContent>
                <SettingsGrid>
                  {/* 왼쪽 컬럼 */}
                  <div>
                    <SettingsSection>
                      <SettingsSectionLabel>
                        {t('language')}
                      </SettingsSectionLabel>
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
                        <SettingsLabel>
                          {t('notifications.enable')}
                        </SettingsLabel>
                        <ToggleSwitch
                          checked={config.notifications.enabled}
                          onChange={() => handleToggleNotification()}
                        />
                      </SettingsRow>
                    </SettingsSection>

                    {/* 분석 설정 */}
                    <SettingsSection>
                      <SettingsSectionLabel>
                        {t('analysis.title')}
                      </SettingsSectionLabel>
                      <SettingsRow>
                        <SettingsLabel>{t('analysis.enable')}</SettingsLabel>
                        <ToggleSwitch
                          checked={config.analysis.enabled}
                          onChange={() => handleToggleAnalysis('enabled')}
                        />
                      </SettingsRow>
                      {config.analysis.enabled && (
                        <>
                          <SettingsRow
                            style={{ marginLeft: '12px', opacity: 0.8 }}
                          >
                            <SettingsLabel>
                              {t('analysis.imageMetadata')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={config.analysis.imageMetadata}
                              onChange={() => handleToggleAnalysis('imageMetadata')}
                            />
                            </SettingsRow>
                            <SettingsRow style={{ marginLeft: '12px', opacity: 0.8 }}>
                            <SettingsLabel>
                              {t('analysis.locationTracking')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={config.analysis.locationTracking}
                              onChange={() =>
                                handleToggleAnalysis('locationTracking')
                              }
                            />
                            </SettingsRow>
                            </>
                            )}

                    </SettingsSection>

                    {/* UI 설정 */}
                    <SettingsSection>
                      <SettingsSectionLabel>
                        {t('ui.title')}
                      </SettingsSectionLabel>

                      <SettingsRow>
                        <SettingsLabel>{t('ui.bytesPerLine')}</SettingsLabel>
                        <SelectWrapper>
                          <StyledSelect
                            value={config.ui.bytesPerLine}
                            onChange={(e) =>
                              handleUIChange(
                                'bytesPerLine',
                                parseInt(e.target.value)
                              )
                            }
                          >
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="32">32</option>
                            <option value="64">64</option>
                          </StyledSelect>
                        </SelectWrapper>
                      </SettingsRow>
                      <SettingsRow>
                        <SettingsLabel>{t('ui.numberBase')}</SettingsLabel>
                        <SelectWrapper>
                          <StyledSelect
                            value={config.ui.numberBase}
                            onChange={(e) =>
                              handleUIChange('numberBase', e.target.value)
                            }
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
                          </StyledSelect>
                        </SelectWrapper>
                      </SettingsRow>
                      <SettingsRow>
                        <SettingsLabel>{t('ui.encoding')}</SettingsLabel>
                        <SelectWrapper>
                          <StyledSelect
                            value={config.ui.encoding}
                            onChange={(e) =>
                              handleUIChange('encoding', e.target.value)
                            }
                          >
                            {encodingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </StyledSelect>
                        </SelectWrapper>
                      </SettingsRow>
                      <SettingsRow>
                        <SettingsLabel>{t('ui.dateFormat')}</SettingsLabel>
                        <SelectWrapper>
                          <StyledSelect
                            value={config.ui.dateFormat}
                            onChange={(e) =>
                              handleUIChange('dateFormat', e.target.value)
                            }
                          >
                            <option value="ISO">
                              {t('ui.dateFormatOptions.ISO')}
                            </option>
                            <option value="US">
                              {t('ui.dateFormatOptions.US')}
                            </option>
                            <option value="KO">
                              {t('ui.dateFormatOptions.KO')}
                            </option>
                          </StyledSelect>
                        </SelectWrapper>
                      </SettingsRow>
                    </SettingsSection>
                  </div>

                  {/* 오른쪽 컬럼 */}
                  <div>
                    {/* 패널 설정 */}
                    <SettingsSection>
                      <SettingsSectionLabel>
                        {t('ui.panelVisibility.title')}
                      </SettingsSectionLabel>
                      {/* Info Panel visibility */}
                      <SettingsRow>
                        <SettingsLabel>
                          {t('ui.panelVisibility.infoPanel')}
                        </SettingsLabel>
                        <ToggleSwitch
                          checked={config.ui.panelVisibility.info.enabled}
                          onChange={() =>
                            handlePanelVisibilityChange('info', 'enabled')
                          }
                        />
                      </SettingsRow>
                      {config.ui.panelVisibility.info.enabled && (
                        <div
                          style={{
                            marginLeft: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          {(
                            [
                              'exifThumbnail',
                              'fileInfo',
                              'map',
                              'exifInfo',
                              'ifdInfo',
                              'exifTags',
                              'textChunks',
                            ] as const
                          ).map((key) => (
                            <SettingsRow key={key} style={{ opacity: 0.8 }}>
                              <SettingsLabel>
                                {t(`ui.panelVisibility.${key}`)}
                              </SettingsLabel>
                              <ToggleSwitch
                                checked={config.ui.panelVisibility.info[key]}
                                onChange={() =>
                                  handlePanelVisibilityChange('info', key)
                                }
                              />
                            </SettingsRow>
                          ))}
                        </div>
                      )}

                      {/* Tools Panel visibility */}
                      <SettingsRow style={{ marginTop: '8px' }}>
                        <SettingsLabel>
                          {t('ui.panelVisibility.toolsPanel')}
                        </SettingsLabel>
                        <ToggleSwitch
                          checked={config.ui.panelVisibility.tools.enabled}
                          onChange={() =>
                            handlePanelVisibilityChange('tools', 'enabled')
                          }
                        />
                      </SettingsRow>
                      {config.ui.panelVisibility.tools.enabled && (
                        <div
                          style={{
                            marginLeft: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <SettingsRow style={{ opacity: 0.8 }}>
                            <SettingsLabel>
                              {t('ui.panelVisibility.searcher')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={config.ui.panelVisibility.tools.searcher}
                              onChange={() =>
                                handlePanelVisibilityChange('tools', 'searcher')
                              }
                            />
                          </SettingsRow>
                          <SettingsRow style={{ opacity: 0.8 }}>
                            <SettingsLabel>
                              {t('ui.panelVisibility.hashCalculator')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={
                                config.ui.panelVisibility.tools.hashCalculator
                              }
                              onChange={() =>
                                handlePanelVisibilityChange(
                                  'tools',
                                  'hashCalculator'
                                )
                              }
                            />
                          </SettingsRow>
                          <SettingsRow style={{ opacity: 0.8 }}>
                            <SettingsLabel>
                              {t('ui.panelVisibility.dataConverter')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={
                                config.ui.panelVisibility.tools.dataConverter
                              }
                              onChange={() =>
                                handlePanelVisibilityChange(
                                  'tools',
                                  'dataConverter'
                                )
                              }
                            />
                          </SettingsRow>
                          <SettingsRow style={{ opacity: 0.8 }}>
                            <SettingsLabel>
                              {t('ui.panelVisibility.dataInspector')}
                            </SettingsLabel>
                            <ToggleSwitch
                              checked={
                                config.ui.panelVisibility.tools.dataInspector
                              }
                              onChange={() =>
                                handlePanelVisibilityChange(
                                  'tools',
                                  'dataInspector'
                                )
                              }
                            />
                          </SettingsRow>
                        </div>
                      )}
                    </SettingsSection>
                  </div>
                </SettingsGrid>

                {/* 설정 초기화 */}
                <SettingsSection
                  style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    border: 'None',
                  }}
                >
                  <ResetButton
                    onClick={resetConfig}
                    disabled={isProcessing || isPending}
                  >
                    {t('resetSettings')}
                  </ResetButton>
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
              </SettingsContent>
            </SettingsPanel>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </SettingsWrapper>
  );
};

export default SettingsModal;
