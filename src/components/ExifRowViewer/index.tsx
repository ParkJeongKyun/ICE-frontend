import Collapse from '@/components/common/Collapse';
import React, { useCallback } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { isValidLocation } from '@/utils/getAddress';
import LeafletMap from '@/components/LeafletMap';
import Tooltip from '@/components/common/Tooltip';
import { useTab } from '@/contexts/TabDataContext';
import { getBytes, getDate } from '@/utils/exifParser';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '../common/Icons/ChevronRightIcon';
import { useRefs } from '@/contexts/RefContext';

const ExifRowViewer: React.FC = () => {
  const { activeData } = useTab();
  const { t } = useTranslation();
  const { searcherRef } = useRefs();
  const fileSize = activeData?.file?.size ?? 0;

  const getExifTagLabel = (tagMeta: string): { name: string; description: string } => {
    const tagKey = `${tagMeta}`;
    const translation = t(tagKey, { ns: 'exifTags', returnObjects: true });
    if (translation && typeof translation === 'object' && 'name' in translation) {
      return translation as { name: string; description: string };
    }

    return { name: tagMeta, description: '' };
  };

  const getExifDataDisplay = (tag: string, rawData: string): string => {
    const examples = t(tag, { ns: 'exifExamples', returnObjects: true });
    if (examples && typeof examples === 'object' && rawData in examples) {
      return (examples as Record<string, string>)[rawData];
    }
    return rawData;
  };

  // 절대 오프셋 이동 핸들러 수정
  const handleJumpToAbsoluteOffset = useCallback(
    async (relativeOffset: number, length: number, tag: string) => {
      if (!searcherRef?.current) return;

      // 1. 첫 번째 행(ExifOffset)에서 baseOffset 가져오기
      const exifOffsetItem = activeData?.rows.find(row => row.tag === "ExifOffset");
      const baseOffset = parseInt(exifOffsetItem?.data || "0", 10);

      // 2. 진짜 파일 내 주소 계산 (시작점 + 상대 오프셋)
      // 단, 'ExifOffset' 태그 자체를 누를 때는 그냥 baseOffset 위치로 가야 함
      const absoluteOffset = tag === "ExifOffset" ? relativeOffset : baseOffset + relativeOffset;

      if (absoluteOffset < 0 || absoluteOffset >= fileSize) return;

      // 3. Hex 뷰어로 점프 (보통 헥사 스트링이나 숫자로 전달)
      const hexStr = absoluteOffset.toString(16);
      await searcherRef.current.findByOffset(hexStr, length);
    },
    [searcherRef, fileSize, activeData?.rows]
  );

  // 2. 신규 핸들러: 실제 데이터 본체로 이동 (isFar 전용)
  const handleJumpToRealDataOffset = useCallback(
    async (item: any) => {
      if (!searcherRef?.current || !activeData?.file || !activeData?.rows) return;

      // 1. 기준점(baseOffset) 찾기
      const exifOffsetItem = activeData.rows.find(row => row.tag === "ExifOffset");
      const baseOffset = parseInt(exifOffsetItem?.data || "0", 10);

      // 2. 파일 객체에서 해당 영역 읽기
      const file = activeData.file;
      const entryValueAddress = baseOffset + item.offset;
      console.log("Entry Value Address:", item);

      if (!item.isFar) {
        // 4바이트 이하: 엔트리 위치가 곧 데이터 위치
        const hexStr = entryValueAddress.toString(16);
        await searcherRef.current.findByOffset(hexStr, item.length);
      } else {
        // 4바이트 초과: 엔트리에 적힌 4바이트 주소값을 읽어야 함
        const blob = file.slice(entryValueAddress, entryValueAddress + 4);
        const buffer = await blob.arrayBuffer();

        // TIFF는 보통 리틀 엔디언(II)을 사용하므로 true로 설정
        // (만약 Big Endian(MM) 파일이면 false여야 하지만 대부분의 카메라는 리틀 엔디언임)
        const dataView = new DataView(buffer);
        const pointerValue = dataView.getUint32(0, true);

        // 진짜 데이터 주소 = baseOffset + 포인터 값
        const realDataAddress = baseOffset + pointerValue;

        const hexStr = realDataAddress.toString(16);
        await searcherRef.current.findByOffset(hexStr, item.length);
      }
    },
    [searcherRef, activeData, fileSize]
  );

  return (
    <ViewerDiv>
      {activeData?.thumbnail && (
        <Collapse
          title={t('exifViewer.thumbnail')}
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
          title={t('exifViewer.fileInfo')}
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.fileName')}</CellHeaderDiv>
                <CellBodyDiv>{activeData.fileinfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.lastModified')}</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeData.fileinfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.size')}</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeData.fileinfo.size)}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.mimeTypeMessage')}>
                    {t('exifViewer.mimeType')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.mime_type || '-'}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.appropriateExtensionMessage')}>
                    {t('exifViewer.appropriateExtension')}
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
      {
        isValidLocation(activeData?.location.lat, activeData?.location.lng) && (
          <Collapse
            title={t('exifViewer.map')}
            children={
              <>
                <LeafletMap
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
          title={t('exifViewer.exifData')}
          children={
            <>
              {activeData.rows.map((item, index) => {
                const { name, description } = getExifTagLabel(item.tag);
                const displayData = getExifDataDisplay(item.tag, item.data);

                let thumbnailUrl: string | null = null;

                if (item.tag === 'JPEGInterchangeFormat') {
                  // 헥스 문자열을 Uint8Array로 변환 후 Blob 생성
                  const cleanHex = item.data.replace(/[^0-9a-fA-F]/g, '');
                  const byteArray = new Uint8Array(
                    cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
                  );
                  const blob = new Blob([byteArray], { type: 'image/jpeg' });
                  thumbnailUrl = URL.createObjectURL(blob);
                  // 이 URL을 <img> 태그의 src로 사용 가능합니다.
                }
                return (
                  <ContentDiv key={`${index}-info`}>
                    <CellHeaderDiv>
                      <Tooltip text={description}>
                        {name}
                      </Tooltip>
                      <JumpButton onClick={() => handleJumpToAbsoluteOffset(item?.offset, item?.length, item.tag)}>
                        <ChevronRightIcon />
                      </JumpButton>
                    </CellHeaderDiv>
                    <CellBodyDiv>

                      {thumbnailUrl && item.tag === 'JPEGInterchangeFormat' ? (
                        <ThumbDiv>
                          <Thumbnail src={thumbnailUrl} />
                        </ThumbDiv>
                      ) : (
                        <Tooltip text={item.data}>{displayData}</Tooltip>
                      )
                      }
                      {item.tag !== "ExifOffset" && (
                        <JumpButton
                          style={{ marginLeft: '8px', opacity: 0.7 }}
                          onClick={() => handleJumpToRealDataOffset(item)}
                        >
                          <ChevronRightIcon />
                        </JumpButton>
                      )}
                    </CellBodyDiv>
                  </ContentDiv>
                );
              })}
            </>
          }
          open
        />
      )}
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
