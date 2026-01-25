import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '@/contexts/TabDataContext';
import Collapse from '@/components/common/Collapse';
import LeafletMap from '@/components/LeafletMap';
import { isValidLocation } from '@/utils/getAddress';
import { NoDataMessage } from '../index.styles';

const MapCollapse: React.FC = () => {
  const { t } = useTranslation();
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
