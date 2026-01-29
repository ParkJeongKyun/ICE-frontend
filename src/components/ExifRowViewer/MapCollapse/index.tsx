'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import { isValidLocation } from '@/utils/getAddress';
import { NoDataMessage } from '../ExifRowViewer.styles';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/LeafletMap/LeafletMap'), {
  ssr: false,
  loading: () => <div style={{ height: '300px' }}>Loading Map...</div>,
});

const MapCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const lat = activeData?.exifInfo?.location?.lat;
  const lng = activeData?.exifInfo?.location?.lng;
  const isValid = isValidLocation(lat, lng);

  return (
    <Collapse
      title={t('exifViewer.map')}
      children={
        isValid ? (
          <LeafletMap latitude={lat || ''} longitude={lng || ''} />
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      removePadding={isValid}
      open
    />
  );
};

export default React.memo(MapCollapse);
