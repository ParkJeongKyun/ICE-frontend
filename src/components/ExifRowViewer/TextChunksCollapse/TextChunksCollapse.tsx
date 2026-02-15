import React from 'react';
import { useTranslations } from 'next-intl';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  NoDataMessage,
} from '../ExifRowViewer.styles';

const TextChunksCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const textChunkData = activeData?.textChunkData;

  return (
    <>
      <Collapse title={t('textChunksViewer.ihdrInfo')} open>
        {!textChunkData ? (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        ) : (
          <>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.width.description')}>
                  {t('textChunks.width.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.width ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.height.description')}>
                  {t('textChunks.height.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.height ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.bitDepth.description')}>
                  {t('textChunks.bitDepth.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.bitDepth ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.colorType.description')}>
                  {t('textChunks.colorType.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.colorType ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.compression.description')}>
                  {t('textChunks.compression.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.compression ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.filter.description')}>
                  {t('textChunks.filter.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.filter ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                <Tooltip text={t('textChunks.interlace.description')}>
                  {t('textChunks.interlace.name')}
                </Tooltip>
              </CellHeaderDiv>
              <CellBodyDiv>{textChunkData.interlace ?? '-'}</CellBodyDiv>
            </ContentDiv>
          </>
        )}
      </Collapse>
      <Collapse title={t('textChunksViewer.textChunks')} open>
        {!textChunkData ||
        !textChunkData.chunks ||
        textChunkData.chunks.length === 0 ? (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        ) : (
          <>
            {textChunkData.chunks.map((chunk, idx) => (
              <ContentDiv key={idx}>
                <CellHeaderDiv>
                  {chunk.type ? ` (${chunk.type})` : ''}
                  {chunk.keyword && (
                    <>
                      <Tooltip text={t('textChunks.keyword.description')}>
                        {chunk.keyword}
                      </Tooltip>
                    </>
                  )}
                </CellHeaderDiv>
                <CellBodyDiv style={{ wordBreak: 'break-all', fontSize: 13 }}>
                  <Tooltip text={t('textChunks.data.description')}>
                    {chunk.data || '-'}
                  </Tooltip>
                </CellBodyDiv>
              </ContentDiv>
            ))}
          </>
        )}
      </Collapse>
    </>
  );
};

export default React.memo(TextChunksCollapse);
