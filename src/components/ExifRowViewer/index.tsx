import React from 'react';
import { ViewerDiv } from './index.styles';
import ExifThumbnailCollapse from './ExifThumbnailCollapse';
import FileInfoCollapse from './FileInfoCollapse';
import MapCollapse from './MapCollapse';
import ExifInfoCollapse from './ExifInfoCollapse';
import IfdInfoCollapse from './IfdInfoCollapse';
import ExifTagsCollapse from './ExifTagsCollapse';

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
