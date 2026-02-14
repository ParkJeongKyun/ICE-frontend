'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { WorkerManager, type WorkerEvents } from '@/utils/WorkerManager';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import eventBus from '@/types/eventBus';
import { WorkerStats } from '@/types/worker/index.worker.types';

interface WorkerContextType {
  hashManager: WorkerManager | null; // 제네릭 제거!
  analysisManager: WorkerManager | null; // 제네릭 제거!
  chunkWorker: Worker | null;
  isWasmReady: boolean;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ✅ Manager를 State로 관리하여 초기화 직후 리렌더링 유발 (하위 컴포넌트가 null 안 받게)
  const [managers, setManagers] = useState<{
    hashManager: WorkerManager | null; // 제네릭 제거!
    analysisManager: WorkerManager | null; // 제네릭 제거!
    chunkWorker: Worker | null;
  }>({
    hashManager: null,
    analysisManager: null,
    chunkWorker: null,
  });

  const [isWasmReady, setIsWasmReady] = useState(false);

  const {
    startHashProcessing,
    stopHashProcessing,
    startAnalysisProcessing,
    stopAnalysisProcessing,
  } = useProcess();

  useEffect(() => {
    startAnalysisProcessing();

    let hashManager: WorkerManager | null = null; // 제네릭 제거!
    let analysisManager: WorkerManager | null = null; // 제네릭 제거!
    let chunkWorker: Worker | null = null;

    try {
      // 청크 워커만 직접 생성 (스트리밍용)
      const chunkWorkerInstance = new Worker(
        new URL('../../workers/chunk.worker.ts', import.meta.url)
      );

      // Manager 생성 (워커 팩토리 함수 전달)
      hashManager = new WorkerManager(
        () =>
          new Worker(new URL('../../workers/hash.worker.ts', import.meta.url)),
        {
          startProcessing: startHashProcessing,
          stopProcessing: stopHashProcessing,
        }
      );

      analysisManager = new WorkerManager(
        () =>
          new Worker(
            new URL('../../workers/analysis.worker.ts', import.meta.url)
          ),
        {
          startProcessing: startAnalysisProcessing,
          stopProcessing: stopAnalysisProcessing,
        }
      );

      chunkWorker = chunkWorkerInstance;

      // State 업데이트 (리렌더링 트리거)
      setManagers({
        hashManager,
        analysisManager,
        chunkWorker,
      });

      // ---------------------------------------------------------
      // 독립적인 이벤트 리스너 설정 (완벽한 채널 분리)
      // ---------------------------------------------------------

      // ✅ 1. 해시 매니저 전용 이벤트
      if (hashManager) {
        hashManager.events.on('PROGRESS', (data) => {
          eventBus.emit('hashProgress', data);
        });

        hashManager.events.on('DONE', () => {
          eventBus.emit('hashProgress', null);
        });

        hashManager.events.on('ERROR', (err) => {
          eventBus.emit('toast', { code: err.code }); // 토스트 띄우기
          eventBus.emit('hashProgress', null); // 해시 진행률 0으로
          stopHashProcessing(); // 🚀 해시 스피너만 끄기! (분석은 건드리지 않음)
        });
      }

      // ✅ 2. 분석(검색) 매니저 전용 이벤트
      if (analysisManager) {
        analysisManager.events.on('WASM_READY', () => {
          setIsWasmReady(true);
          stopAnalysisProcessing();
        });

        analysisManager.events.on('PROGRESS', (data) => {
          eventBus.emit('analysisProgress', data);
        });

        analysisManager.events.on('DONE', () => {
          eventBus.emit('analysisProgress', null);
        });

        analysisManager.events.on('ERROR', (err) => {
          eventBus.emit('toast', { code: err.code }); // 토스트 띄우기
          eventBus.emit('analysisProgress', null); // 검색 진행률 0으로
          stopAnalysisProcessing(); // 🚀 검색 스피너만 끄기! (해시는 건드리지 않음)
        });
      }

      return () => {
        hashManager?.terminate();
        analysisManager?.terminate();
        chunkWorker?.terminate();
      };
    } catch (error) {
      console.error('[WorkerContext] Failed to create workers:', error);
      stopAnalysisProcessing();

      // 초기화 실패 에러
      eventBus.emit('toast', {
        code: 'WORKER_CREATION_FAILED',
      });
    }

    // 의존성 배열을 비워서 마운트 시 1회만 실행되도록 함 (안전)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      hashManager: managers.hashManager,
      analysisManager: managers.analysisManager,
      chunkWorker: managers.chunkWorker,
      isWasmReady,
    }),
    [managers, isWasmReady]
  );

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) throw new Error('useWorker must be used within WorkerProvider');
  return context;
};
