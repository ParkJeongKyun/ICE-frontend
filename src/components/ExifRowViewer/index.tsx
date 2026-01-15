import Collapse from '@/components/common/Collapse';
import React from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { isValidLocation } from '@/utils/getAddress';
import LeafletMap from '@/components/LeafletMap';
import Tooltip from '@/components/common/Tooltip';
import { useTab } from '@/contexts/TabDataContext';
import { getBytes, getDate } from '@/utils/exifParser';
import { useTranslation } from 'react-i18next';

const ExifRowViewer: React.FC = () => {
  const { activeData } = useTab();
  const { t } = useTranslation();

  const getExifTagLabel = (tagMeta: string): { name: string; description: string } => {
    const tagKey = `${tagMeta}`;
    const translation = t(tagKey, { ns: 'exifTags', returnObjects: true });
    if (translation && typeof translation === 'object' && 'name' in translation) {
      return translation as { name: string; description: string };
    }
    
    return { name: tagMeta, description: '' };
  };

  const getExifDataDisplay = (tag: string, rawData: string): string => {
    const examples = t(tag, { ns: 'exifExamples', returnObjects: true });
    if (examples && typeof examples === 'object' && rawData in examples) {
      return (examples as Record<string, string>)[rawData];
    }
    return rawData;
  };

  return (
    <ViewerDiv>
      {activeData?.thumbnail && (
        <Collapse
          title={t('exifViewer.thumbnail')}
          children={
            <>
              <ThumbDiv>
                <Thumbnail src={activeData?.thumbnail} />
              </ThumbDiv>
            </>
          }
          open
        />
      )}
      {activeData?.fileinfo && (
        <Collapse
          title={t('exifViewer.fileInfo')}
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.fileName')}</CellHeaderDiv>
                <CellBodyDiv>{activeData.fileinfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.lastModified')}</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeData.fileinfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.size')}</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeData.fileinfo.size)}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('dataInspector.noSelection')}>
                    {t('exifViewer.mimeType')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.mime_type || '-'}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('dataInspector.noSelection')}>
                    {t('exifViewer.appropriateExtension')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.extension || '-'}
                </CellBodyDiv>
              </ContentDiv>
            </>
          }
          open
        />
      )}
      {
        isValidLocation(activeData?.location.lat, activeData?.location.lng) && (
          <Collapse
            title={t('exifViewer.map')}
            children={
              <>
                <LeafletMap
                  latitude={activeData?.location.lat || ''}
                  longitude={activeData?.location.lng || ''}
                />
              </>
            }
            open
            removePadding
          />
        )}
      {activeData?.rows && activeData.rows.length > 0 && (
        <Collapse
          title={t('exifViewer.exifData')}
          children={
            <>
              {activeData.rows.map((item, index) => {
                const { name, description } = getExifTagLabel(item.tag);
                const displayData = getExifDataDisplay(item.tag, item.data);
                return (
                  <ContentDiv key={`${index}-info`}>
                    <CellHeaderDiv>
                      <Tooltip text={description}>
                        {name}
                      </Tooltip>
                    </CellHeaderDiv>
                    <CellBodyDiv>
                      <Tooltip text={item.data}>{displayData}</Tooltip>
                    </CellBodyDiv>
                  </ContentDiv>
                );
              })}
            </>
          }
          open
        />
      )}
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
