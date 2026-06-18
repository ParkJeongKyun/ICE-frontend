'use client';

import React from 'react';
import ExifThumbnailCollapse from './sub/ExifThumbnailCollapse';
import MapCollapse from './sub/MapCollapse';
import ExifInfoCollapse from './sub/ExifInfoCollapse';
import IfdInfoCollapse from './sub/IfdInfoCollapse';
import ExifTagsCollapse from './sub/ExifTagsCollapse';
import TextChunksCollapse from './sub/TextChunksCollapse';

const ImageInfoCollapse: React.FC = () => {
  return (
    <>
      <ExifThumbnailCollapse />
      <MapCollapse />
      <ExifInfoCollapse />
      <IfdInfoCollapse />
      <ExifTagsCollapse />
      <TextChunksCollapse />
    </>
  );
};

export default React.memo(ImageInfoCollapse);
