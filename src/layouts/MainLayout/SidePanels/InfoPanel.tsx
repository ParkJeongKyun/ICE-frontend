import React from 'react';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import ExifThumbnailCollapse from '@/components/InfoCollapse/ExifThumbnailCollapse/ExifThumbnailCollapse';
import FileInfoCollapse from '@/components/InfoCollapse/FileInfoCollapse/FileInfoCollapse';
import MapCollapse from '@/components/InfoCollapse/MapCollapse';
import ExifInfoCollapse from '@/components/InfoCollapse/ExifInfoCollapse/ExifInfoCollapse';
import IfdInfoCollapse from '@/components/InfoCollapse/IfdInfoCollapse/IfdInfoCollapse';
import ExifTagsCollapse from '@/components/InfoCollapse/ExifTagsCollapse/ExifTagsCollapse';
import TextChunksCollapse from '@/components/InfoCollapse/TextChunksCollapse/TextChunksCollapse';
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
      {isImageEngineUsed && (
        <>
          {v.exifThumbnail && <ExifThumbnailCollapse />}
          {v.map && <MapCollapse />}
          {v.exifInfo && <ExifInfoCollapse />}
          {v.ifdInfo && <IfdInfoCollapse />}
          {v.exifTags && <ExifTagsCollapse />}
          {v.textChunks && <TextChunksCollapse />}
        </>
      )}

      {isPeEngineUsed && <>{v.peInfo && <PeInfoCollapse />}</>}
    </div>
  );
};

export default InfoPanel;
