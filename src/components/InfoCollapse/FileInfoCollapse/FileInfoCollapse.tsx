'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import Collapse from '@/components/common/Collapse/Collapse';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import {
  AnalyzerBadge,
  AnalyzerBadgeContainer,
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  NoDataMessage,
} from '../InfoCollapse.styles';
import { getBytes, getDate } from '@/utils/formatters';

const FileInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeData } = useTab();
  const fileInfo = activeData?.fileInfo;
  const engines = activeData?.engines;

  const analyzers = [
    { key: 'Core', active: !!engines?.core },
    { key: 'Image', active: !!engines?.image },
    { key: 'Pe', active: !!engines?.pe },
    { key: 'Apk', active: false },
    { key: 'Elf', active: false },
  ];

  return (
    <Collapse
      id="file-info"
      title={t('fileInfo.title')}
      children={
        fileInfo ? (
          <>
            <ContentDiv>
              <CellHeaderDiv>{t('fileInfo.fileName')}</CellHeaderDiv>
              <CellBodyDiv>{fileInfo.name}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('fileInfo.lastModified')}</CellHeaderDiv>
              <CellBodyDiv>
                {getDate(fileInfo.lastModified, config.ui.dateFormat)}
              </CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('fileInfo.size')}</CellHeaderDiv>
              <CellBodyDiv>{getBytes(fileInfo.size)}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('fileInfo.mimeTypeMessage')}>
                  {t('fileInfo.mimeType')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{fileInfo.mimeType || '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('fileInfo.appropriateExtensionMessage')}>
                  {t('fileInfo.appropriateExtension')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{fileInfo.extension || '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('fileInfo.analyzers')}>
                  {t('fileInfo.analyzers')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>
                <AnalyzerBadgeContainer>
                  {analyzers.map((analyzer) => (
                    <Tooltip
                      key={analyzer.key}
                      text={t(`analyzers.analyzer${analyzer.key}Desc`)}
                    >
                      <AnalyzerBadge $active={analyzer.active}>
                        {t(`analyzers.analyzer${analyzer.key}`)}
                      </AnalyzerBadge>
                    </Tooltip>
                  ))}
                </AnalyzerBadgeContainer>
              </CellBodyDiv>
            </ContentDiv>
          </>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(FileInfoCollapse);
