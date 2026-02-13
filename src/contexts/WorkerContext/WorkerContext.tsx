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
  hashManager: WorkerManager | null; // 🚀 제네릭 제거!
  analysisManager: WorkerManager | null; // 🚀 제네릭 제거!
  chunkWorker: Worker | null;
  isWasmReady: boolean;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ✅ Manager를 State로 관리하여 초기화 직후 리렌더링 유발 (하위 컴포넌트가 null 안 받게)
  const [managers, setManagers] = useState<{
    hashManager: WorkerManager | null; // 🚀 제네릭 제거!
    analysisManager: WorkerManager | null; // 🚀 제네릭 제거!
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

    let hashManager: WorkerManager | null = null; // 🚀 제네릭 제거!
    let analysisManager: WorkerManager | null = null; // 🚀 제네릭 제거!
    let chunkWorker: Worker | null = null;

    try {
      // 1️⃣ 워커 생성
      const hashWorkerInstance = new Worker(
        new URL('../../workers/hash.worker.ts', import.meta.url)
      );
      const analysisWorkerInstance = new Worker(
        new URL('../../workers/analysis.worker.ts', import.meta.url)
      );
      const chunkWorkerInstance = new Worker(
        new URL('../../workers/chunk.worker.ts', import.meta.url)
      );

      // 2️⃣ Manager 생성 (🚀 제네릭 제거!)
      hashManager = new WorkerManager(hashWorkerInstance, {
        startProcessing: startHashProcessing,
        stopProcessing: stopHashProcessing,
      });

      analysisManager = new WorkerManager(analysisWorkerInstance, {
        startProcessing: startAnalysisProcessing,
        stopProcessing: stopAnalysisProcessing,
      });

      chunkWorker = chunkWorkerInstance;

      // 3️⃣ State 업데이트 (리렌더링 트리거)
      setManagers({
        hashManager,
        analysisManager,
        chunkWorker,
      });

      // ✅ WASM 초기화
      analysisWorkerInstance.postMessage({ type: 'RELOAD_WASM' });

      // 4️⃣ 이벤트 리스너 설정
      // WASM Ready
      if (analysisManager) {
        analysisManager.events.on('WASM_READY', () => {
          setIsWasmReady(true);
          stopAnalysisProcessing();
          eventBus.emit('toast', { code: 'WASM_LOADED_SUCCESS' });
        });
      }

      // ✅ 공통 에러 핸들러 (중앙 집중식 에러 처리)
      const handleGlobalError = (err: { code: string }) => {
        console.error(`[Global Error] ${err.code}`);

        // 토스트 메시지 전송 (코드만 - UI에서 처리)
        eventBus.emit('toast', {
          code: err.code,
        });

        // 에러 발생 시 전역 처리 상태 중단
        stopAnalysisProcessing();
        stopHashProcessing();
      };

      // 각 매니저에 에러 리스너 등록
      if (hashManager) {
        hashManager.events.on('ERROR', handleGlobalError);
      }
      if (analysisManager) {
        analysisManager.events.on('ERROR', handleGlobalError);
      }

      // ---------------------------------------------------------
      // Progress Aggregation Logic
      // ---------------------------------------------------------
      const progressMap = new Map<string, WorkerStats>();
      let rafId: number | null = null;

      const emitAggregated = () => {
        let totalBytes = 0;
        let processedBytes = 0;
        let totalSpeed = 0;
        let fileName = '';
        let durationMs = 0;

        for (const data of progressMap.values()) {
          totalBytes += data.totalBytes ?? 0;
          processedBytes += data.processedBytes ?? 0;
          totalSpeed += data.speed ?? 0;
          if (data.fileName) fileName = data.fileName;
          if (data.durationMs)
            durationMs = Math.max(durationMs, data.durationMs);
        }

        eventBus.emit('progress', {
          id: 'aggregated',
          speed: totalSpeed,
          processedBytes,
          totalBytes,
          fileName,
          durationMs,
          durationSec: durationMs / 1000,
        } as WorkerStats);

        rafId = null;
      };

      const scheduleEmit = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(emitAggregated);
        }
      };

      const updateProgress = (source: string, data: WorkerStats) => {
        const key = `${source}:${data.id}`;
        progressMap.set(key, data);
        scheduleEmit();
      };

      const cleanupProgress = (source: string, id: string) => {
        const key = `${source}:${id}`;
        progressMap.delete(key);
        scheduleEmit();
      };

      // Hash Events
      if (hashManager) {
        hashManager.events.on('PROGRESS', (data) =>
          updateProgress('hash', data)
        );
        hashManager.events.on('DONE', (e) =>
          cleanupProgress('hash', e.stats?.id ?? '')
        );
      }

      // Analysis Events
      if (analysisManager) {
        analysisManager.events.on('PROGRESS', (data) =>
          updateProgress('analysis', data)
        );
        analysisManager.events.on('DONE', (e) =>
          cleanupProgress('analysis', e.stats?.id ?? '')
        );
      }

      return () => {
        hashManager?.terminate();
        analysisManager?.terminate();
        chunkWorker?.terminate();
      };
    } catch (error) {
      console.error('[WorkerContext] Failed to init workers:', error);
      stopAnalysisProcessing();

      // ✅ 초기화 실패 에러
      eventBus.emit('toast', {
        code: 'WORKER_INIT_FAILED',
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
