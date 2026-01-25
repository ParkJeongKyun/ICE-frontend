import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '@/contexts/TabDataContext';
import Collapse from '@/components/common/Collapse';
import { ThumbDiv, Thumbnail, NoDataMessage } from '../index.styles';

const ExifThumbnailCollapse: React.FC = () => {
  const { t } = useTranslation();
  const { activeData } = useTab();
  const thumbnail = activeData?.exifInfo?.thumbnail;

  return (
    <Collapse
      title={t('exifViewer.thumbnail')}
      children={
        thumbnail ? (
          <ThumbDiv>
            <Thumbnail src={thumbnail} />
          </ThumbDiv>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(ExifThumbnailCollapse);
