'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import { ThumbDiv, Thumbnail, NoDataMessage } from '../ExifRowViewer.styles';

const ExifThumbnailCollapse: React.FC = () => {
  const t = useTranslations();
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
