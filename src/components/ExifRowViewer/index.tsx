import Collapse from '@/components/common/Collapse';
import React from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { isValidLocation } from '@/utils/getAddress';
import KakaoMap from '@/components/KakaoMap';
import Tooltip from '@/components/common/Tooltip';
import { useTabData } from '@/contexts/TabDataContext';
import { getBytes, getDate } from '@/utils/exifParser';

const ExifRowViewer: React.FC = () => {
  const { activeData } = useTabData();

  return (
    <ViewerDiv>
      {activeData?.thumbnail && (
        <Collapse
          title="Thumbnail"
          children={
            <>
              <ThumbDiv>
                <Thumbnail src={activeData?.thumbnail} />
              </ThumbDiv>
            </>
          }
          open
        />
      )}
      {activeData?.fileinfo && (
        <Collapse
          title="File Info"
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>파일명</CellHeaderDiv>
                <CellBodyDiv>{activeData.fileinfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>마지막 수정 시간</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeData.fileinfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>크기</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeData.fileinfo.size)}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={'파일내용 기반 MIME 표준 포맷 추측'}>
                    MIME 타입
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.mime_type || '-'}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip
                    text={'시그니처/푸터/파일내용 기반 파일 확장자 추측 결과'}
                  >
                    적절한 확장자
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.extension || '-'}
                </CellBodyDiv>
              </ContentDiv>
            </>
          }
          open
        />
      )}
      {activeData?.location.address &&
        isValidLocation(activeData?.location.lat, activeData?.location.lng) && (
          <Collapse
            title="Map"
            children={
              <>
                <KakaoMap
                  latitude={activeData?.location.lat || ''}
                  longitude={activeData?.location.lng || ''}
                />
              </>
            }
            open
            removePadding
          />
        )}
      {activeData?.rows && activeData.rows.length > 0 && (
        <Collapse
          title="Exif Data"
          children={
            <>
              {activeData.rows.map((item, index) => (
                <ContentDiv key={`${index}-info`}>
                  <CellHeaderDiv>
                    <Tooltip text={item.meta}>
                      {item.name.split('(')[0]}
                    </Tooltip>
                  </CellHeaderDiv>
                  <CellBodyDiv>
                    <Tooltip text={item.origindata}>{item.data}</Tooltip>
                  </CellBodyDiv>
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
