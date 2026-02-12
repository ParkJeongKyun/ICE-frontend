'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { WorkerManager, type WorkerEvents } from '@/utils/WorkerManager';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import eventBus from '@/types/eventBus';
import { HashResult } from '@/types/worker/hash.worker.types';
import { ExifResult, SearchResult } from '@/types/worker/analysis.worker.types';
import { WorkerStats } from '@/types/worker/index.worker.types';

interface WorkerContextType {
  // ✅ 제네릭으로 분리된 타입
  hashManager: WorkerManager<HashResult> | null;
  analysisManager: WorkerManager<SearchResult | ExifResult> | null;
  chunkWorker: Worker | null;
  isWasmReady: boolean;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const hashManagerRef = useRef<WorkerManager<HashResult> | null>(null);
  const analysisManagerRef = useRef<WorkerManager<
    SearchResult | ExifResult
  > | null>(null);
  const chunkWorkerRef = useRef<Worker | null>(null);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const {
    startHashProcessing,
    stopHashProcessing,
    startAnalysisProcessing,
    stopAnalysisProcessing,
  } = useProcess();

  useEffect(() => {
    startAnalysisProcessing();
    try {
      // 1️⃣ 워커를 "직접" 생성 (Webpack이 경로를 인식할 수 있도록)
      const hashWorker = new Worker(
        new URL('../../workers/hash.worker.ts', import.meta.url)
      );
      const analysisWorker = new Worker(
        new URL('../../workers/analysis.worker.ts', import.meta.url)
      );
      const chunkWorker = new Worker(
        new URL('../../workers/chunk.worker.ts', import.meta.url)
      );

      // 2️⃣ 생성된 워커를 Manager에게 "주입" (제너릭 타입 명시)
      hashManagerRef.current = new WorkerManager<HashResult>(hashWorker, {
        startProcessing: startHashProcessing,
        stopProcessing: stopHashProcessing,
      });
      analysisManagerRef.current = new WorkerManager<SearchResult | ExifResult>(
        analysisWorker,
        {
          startProcessing: startAnalysisProcessing,
          stopProcessing: stopAnalysisProcessing,
        }
      );
      chunkWorkerRef.current = chunkWorker;

      // ✅ WASM 초기화 시작 (Worker 생성 직후)
      analysisWorker.postMessage({ type: 'RELOAD_WASM' });

      // WASM 준비 이벤트 구독
      analysisManagerRef.current!.events.on('WASM_READY', () => {
        setIsWasmReady(true);
        stopAnalysisProcessing();
        eventBus.emit('toast', { code: 'WASM_LOADED_SUCCESS' });
      });

      // Aggregate progress (바이트 기반 계산)
      const progressMap = new Map<
        string,
        {
          processedBytes?: number;
          totalBytes?: number;
          speed?: number;
          fileName?: string;
          startTime: number;
          lastSeen: number;
        }
      >();
      let rafId: number | null = null;

      const emitAggregated = () => {
        let totalBytes = 0;
        let processedBytes = 0;
        let totalSpeed = 0;
        let taskCount = 0;
        let oldestStartTime = Date.now();
        let fileName = '';

        for (const v of progressMap.values()) {
          totalBytes += v.totalBytes ?? 0;
          processedBytes += v.processedBytes ?? 0;
          totalSpeed += v.speed ?? 0;
          if (v.fileName) fileName = v.fileName;
          oldestStartTime = Math.min(oldestStartTime, v.startTime);
          taskCount++;
        }

        const now = Date.now();
        const durationMs = taskCount > 0 ? now - oldestStartTime : 0;
        const durationSec = Math.round(durationMs / 1000);

        eventBus.emit('progress', {
          id: 'aggregated',
          speed: totalSpeed,
          durationMs,
          durationSec,
          processedBytes,
          totalBytes,
          fileName,
        });
        rafId = null;
      };

      const scheduleEmit = () => {
        if (rafId == null) {
          rafId = requestAnimationFrame(emitAggregated);
        }
      };

      const makeKey = (source: string, id?: string | null) => {
        const k = `${source}:${id ?? 'unknown'}`;
        return k;
      };

      // hash progress listener
      const hashProgressHandler = (data: WorkerStats) => {
        const key = makeKey('hash', data.id);
        const existing = progressMap.get(key);
        progressMap.set(key, {
          processedBytes: data.processedBytes,
          totalBytes: data.totalBytes,
          speed: data.speed,
          fileName: data.fileName,
          startTime: existing?.startTime ?? Date.now(),
          lastSeen: Date.now(),
        });
        scheduleEmit();
      };

      const hashDoneHandler = (done: WorkerEvents['DONE']) => {
        const key = makeKey('hash', done.result.stats.id);
        progressMap.delete(key);
        scheduleEmit();

        // HashCalculator에서 결과를 직접 받아서 처리하므로 토스트는 여기서 emit하지 않음
        // 에러는 HashCalculator에서 처리함
      };

      // analysis progress listener
      const analysisProgressHandler = (data: WorkerStats) => {
        const key = makeKey('analysis', data.id);
        const existing = progressMap.get(key);
        progressMap.set(key, {
          processedBytes: data.processedBytes,
          totalBytes: data.totalBytes,
          speed: data.speed,
          fileName: data.fileName,
          startTime: existing?.startTime ?? Date.now(),
          lastSeen: Date.now(),
        });
        scheduleEmit();
      };

      const analysisDoneHandler = (done: WorkerEvents['DONE']) => {
        const key = makeKey('analysis', done.result.stats.id);
        progressMap.delete(key);
        scheduleEmit();
        // 결과 처리는 각 컴포넌트에서 함 (Searcher, MenuBtnZone 등)
      };

      hashManagerRef.current!.events.on('PROGRESS', hashProgressHandler);
      hashManagerRef.current!.events.on('DONE', hashDoneHandler);
      analysisManagerRef.current!.events.on(
        'PROGRESS',
        analysisProgressHandler
      );
      analysisManagerRef.current!.events.on('DONE', analysisDoneHandler);

      // 전역 에러 구독 (Toast 연결)
      const handleError = (err: { code: string; message: string }) => {
        if (err.code === 'WASM_ERROR') {
          setIsWasmReady(false);
          stopAnalysisProcessing();
        } else if (err.code === 'HASH_ERROR') {
          // 해시 워커 에러 시 해시 processing 상태 초기화
          stopHashProcessing();
        } else if (err.code === 'SEARCH_ERROR' || err.code === 'EXIF_ERROR') {
          // 분석 워커 에러 시 분석 processing 상태 초기화
          stopAnalysisProcessing();
        }
        eventBus.emit('toast', {
          code: err.code,
          message: err.message,
        });
      };

      hashManagerRef.current!.events.on('ERROR', handleError);
      analysisManagerRef.current!.events.on('ERROR', handleError);

      chunkWorker.onerror = (event) => {
        console.error('[Chunk Worker] Error:', event.message);
        eventBus.emit('toast', {
          code: 'CHUNK_WORKER_ERROR',
          message: event.message,
        });
      };

      return () => {
        hashManagerRef.current?.terminate();
        analysisManagerRef.current?.terminate();
        chunkWorkerRef.current?.terminate();
      };
    } catch (error) {
      console.error('[WorkerContext] ❌ Failed to create worker:', error);
      stopAnalysisProcessing();
      eventBus.emit('toast', {
        code: 'WORKER_INIT_FAILED',
        message: (error as Error).message,
      });
    }
  }, [
    startHashProcessing,
    stopHashProcessing,
    startAnalysisProcessing,
    stopAnalysisProcessing,
  ]);

  const value = useMemo(
    () => ({
      hashManager: hashManagerRef.current,
      analysisManager: analysisManagerRef.current,
      chunkWorker: chunkWorkerRef.current,
      isWasmReady,
    }),
    [isWasmReady]
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
