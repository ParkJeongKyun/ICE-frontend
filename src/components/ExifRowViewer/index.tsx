import Collapse from 'components/common/Collapse';
import React, { useMemo } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { TabData, TabKey } from 'types';
import { getDate } from 'utils/getDate';
import { getBytes } from 'utils/getBytes';
import { isValidLocation } from 'utils/getAddress';
import KakaoMap from 'components/KakaoMap/KakaoMap';

interface Props {
  activeKey: TabKey;
  datas: TabData;
}

const ExifRowViewer: React.FC<Props> = ({ activeKey, datas }) => {
  const activeItem = useMemo(() => datas.get(activeKey), [datas, activeKey]);

  return (
    <ViewerDiv>
      {activeItem?.thumbnail && (
        <Collapse
          title="Thumbnail"
          children={
            <>
              <ThumbDiv>
                <Thumbnail src={activeItem?.thumbnail} />
              </ThumbDiv>
            </>
          }
          open
        />
      )}
      {activeItem?.fileinfo && (
        <Collapse
          title="File Info"
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>파일명</CellHeaderDiv>
                <CellBodyDiv>{activeItem.fileinfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>마지막 수정 시간</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeItem.fileinfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>크기</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeItem.fileinfo.size)}</CellBodyDiv>
              </ContentDiv>
            </>
          }
          open
        />
      )}
      {isValidLocation(activeItem?.location.lat, activeItem?.location.lng) && (
        <Collapse
          title="Map"
          children={
            <>
              <KakaoMap
                latitude={activeItem?.location.lat || ''}
                longitude={activeItem?.location.lng || ''}
              />
            </>
          }
          open
          removePadding
        />
      )}
      {activeItem?.rows && (
        <Collapse
          title="Exif Data"
          children={
            <>
              {activeItem.rows.map((item, index) => (
                <ContentDiv key={`${index}-info`}>
                  <CellHeaderDiv>{item.name.split('(')[0]}</CellHeaderDiv>
                  <CellBodyDiv>{item.data}</CellBodyDiv>
                </ContentDiv>
              ))}
            </>
          }
          open
        />
      )}
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
