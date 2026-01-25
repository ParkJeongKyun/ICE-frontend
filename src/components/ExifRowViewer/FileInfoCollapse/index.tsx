import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '@/contexts/TabDataContext';
import Collapse from '@/components/common/Collapse';
import Tooltip from '@/components/common/Tooltip';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  NoDataMessage,
} from '../index.styles';
import { getBytes, getDate } from '@/utils/exifParser';

const FileInfoCollapse: React.FC = () => {
  const { t } = useTranslation();
  const { activeData } = useTab();
  const fileInfo = activeData?.fileInfo;

  return (
    <Collapse
      title={t('exifViewer.fileInfo')}
      children={
        fileInfo ? (
          <>
            <ContentDiv>
              <CellHeaderDiv>{t('exifViewer.fileName')}</CellHeaderDiv>
              <CellBodyDiv>{fileInfo.name}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('exifViewer.lastModified')}</CellHeaderDiv>
              <CellBodyDiv>{getDate(fileInfo.lastModified)}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('exifViewer.size')}</CellHeaderDiv>
              <CellBodyDiv>{getBytes(fileInfo.size)}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('exifViewer.mimeTypeMessage')}>
                  {t('exifViewer.mimeType')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{fileInfo.mimeType || '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('exifViewer.appropriateExtensionMessage')}>
                  {t('exifViewer.appropriateExtension')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{fileInfo.extension || '-'}</CellBodyDiv>
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
