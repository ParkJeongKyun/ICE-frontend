import React from 'react';
import { ViewerDiv } from './ExifRowViewer.styles';
import ExifThumbnailCollapse from './ExifThumbnailCollapse/ExifThumbnailCollapse';
import FileInfoCollapse from './FileInfoCollapse/FileInfoCollapse';
import MapCollapse from './MapCollapse';
import ExifInfoCollapse from './ExifInfoCollapse/ExifInfoCollapse';
import IfdInfoCollapse from './IfdInfoCollapse/IfdInfoCollapse';
import ExifTagsCollapse from './ExifTagsCollapse/ExifTagsCollapse';

const ExifRowViewer: React.FC = () => {
  return (
    <ViewerDiv>
      <ExifThumbnailCollapse />
      <FileInfoCollapse />
      <MapCollapse />
      <ExifInfoCollapse />
      <IfdInfoCollapse />
      <ExifTagsCollapse />
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
