import React from 'react';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import ExifThumbnailCollapse from '@/components/ExifRowViewer/ExifThumbnailCollapse/ExifThumbnailCollapse';
import FileInfoCollapse from '@/components/ExifRowViewer/FileInfoCollapse/FileInfoCollapse';
import MapCollapse from '@/components/ExifRowViewer/MapCollapse';
import ExifInfoCollapse from '@/components/ExifRowViewer/ExifInfoCollapse/ExifInfoCollapse';
import IfdInfoCollapse from '@/components/ExifRowViewer/IfdInfoCollapse/IfdInfoCollapse';
import ExifTagsCollapse from '@/components/ExifRowViewer/ExifTagsCollapse/ExifTagsCollapse';
import TextChunksCollapse from '@/components/ExifRowViewer/TextChunksCollapse/TextChunksCollapse';

const InfoPanel: React.FC = () => {
  const { config } = useConfig();
  const v = config.ui.panelVisibility.info;

  if (!v.enabled) return null;

  return (
    <div>
      {v.exifThumbnail && <ExifThumbnailCollapse />}
      {v.fileInfo && <FileInfoCollapse />}
      {v.map && <MapCollapse />}
      {v.exifInfo && <ExifInfoCollapse />}
      {v.ifdInfo && <IfdInfoCollapse />}
      {v.exifTags && <ExifTagsCollapse />}
      {v.textChunks && <TextChunksCollapse />}
    </div>
  );
};

export default InfoPanel;
