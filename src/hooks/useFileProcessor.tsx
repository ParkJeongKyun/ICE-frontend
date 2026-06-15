import { useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
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
  const { config } = useConfig();

  const processFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (!file || !analysisManager) return false;

      try {
        const newActiveKey = getNewKey();

        // 워커 매니저를 통한 파일 분석 요청 (타입 감지 포함 + 설정 전달)
        const engineOptions = {
          enabled: config.analysis.enabled,
          image: {
            enabled: config.engines.image.enabled,
            exif: config.engines.image.exif,
            textChunk: config.engines.image.textChunk,
          },
          pe: config.engines.pe,
        };

        const result = await analysisManager.execute('PROCESS_ANALYSIS', {
          file,
          options: engineOptions,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('[FileProcessor] Analysis result:', result);
        }

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
            exifInfo: result.data.exifInfo,
            textChunkData: result.data.textChunkData,
            peData: result.data.peData,
            engines: result.data.engines,
          },
        }));

        // 새 탭을 활성화하고 성공 토스트 띄우기
        setActiveKey(newActiveKey);

        // 분석이 수행되었는지 여부 판단
        const isAnalysisPerformed =
          result.data.hasExif ||
          !!result.data.textChunkData ||
          !!result.data.peData;

        eventBus.emit('toast', {
          code: isAnalysisPerformed ? 'ANALYSIS_SUCCESS' : 'TAB_CREATED',
          stats: result.stats,
        });
        return true;
      } catch (error) {
        // 에러는 WorkerContext(WorkerManager.ERROR 이벤트)에서 처리됨
        console.error('[FileProcessor] File processing failed:', error);
        return false;
      }
    },
    [analysisManager, getNewKey, setTabData, setActiveKey, hexViewerRef, config]
  );

  return { processFile };
};
