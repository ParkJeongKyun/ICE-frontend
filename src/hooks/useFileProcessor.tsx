import { useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import eventBus from '@/types/eventBus';
import HexViewer from '@/components/HexViewer/HexViewer';

/**
 * 파일 분석 및 탭 생성을 담당하는 재사용 가능한 훅
 * 파일을 받아서 EXIF 분석하고 새로운 탭을 생성합니다.
 */
export const useFileProcessor = () => {
  const { setTabData, setActiveKey, getNewKey } = useTab();
  const { analysisManager } = useWorker();
  const { hexViewerRef } = useRefs();

  const processFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (!file || !analysisManager) return false;

      try {
        const newActiveKey = getNewKey();

        // 1️⃣ 워커 매니저를 통한 파일 분석 요청
        const result = await analysisManager.execute('PROCESS_EXIF', { file });

        if (process.env.NODE_ENV === 'development') {
          console.log('[FileProcessor] EXIF processing result:', result);
        }

        const {
          thumbnail,
          baseOffset,
          dataSize,
          endOffset,
          byteOrder,
          firstIfdOffset,
          location,
          ifdInfos,
          tagInfos,
        } = result.data.exifInfo;

        // 2️⃣ 분석 결과를 바탕으로 새로운 탭 데이터 생성
        setTabData((prevDatas) => ({
          ...prevDatas,
          [newActiveKey]: {
            window: {
              label: file.name,
              contents: <HexViewer ref={hexViewerRef} />,
            },
            file,
            fileInfo: {
              name: file.name,
              lastModified: file.lastModified,
              size: file.size,
              mimeType: result.data.mimeType,
              extension: result.data.extension,
            },
            hasExif: result.data.hasExif || false,
            exifInfo: {
              thumbnail,
              baseOffset,
              dataSize,
              endOffset,
              byteOrder,
              firstIfdOffset,
              location,
              ifdInfos,
              tagInfos,
            },
          },
        }));

        // 3️⃣ 새 탭을 활성화하고 성공 토스트 띄우기
        setActiveKey(newActiveKey);
        eventBus.emit('toast', { code: 'EXIF_SUCCESS', stats: result.stats });
        return true;
      } catch (error) {
        // ✅ 에러는 WorkerContext(WorkerManager.ERROR 이벤트)에서 처리됨
        console.error('[FileProcessor] File processing failed:', error);
        return false;
      }
    },
    [analysisManager, getNewKey, setTabData, setActiveKey, hexViewerRef]
  );

  return { processFile };
};
