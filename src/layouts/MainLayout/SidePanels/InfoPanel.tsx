import React from 'react';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import FileInfoCollapse from '@/components/InfoCollapse/FileInfoCollapse/FileInfoCollapse';
import ImageInfoCollapse from '@/components/InfoCollapse/ImageInfoCollapse/ImageInfoCollapse';
import PeInfoCollapse from '@/components/InfoCollapse/PeInfoCollapse/PeInfoCollapse';

const InfoPanel: React.FC = () => {
  const { config } = useConfig();
  const { activeData } = useTab();
  const v = config.ui.panelVisibility.info;

  if (!v.enabled) return null;

  const engines = activeData?.engines;
  const isImageEngineUsed = !!engines?.image;
  const isPeEngineUsed = !!engines?.pe;

  return (
    <div>
      {v.fileInfo && <FileInfoCollapse />}
      {isImageEngineUsed && <>{v.imageInfo && <ImageInfoCollapse />}</>}
      {isPeEngineUsed && <>{v.peInfo && <PeInfoCollapse />}</>}
    </div>
  );
};

export default InfoPanel;
