'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { TabKey } from '@/types';
import { WorkerManager } from '@/utils/WorkerManager';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import eventBus from '@/utils/eventBus';

interface WorkerCacheData {
  cache: Map<number, Uint8Array>;
  cleanup: () => void;
}

interface WorkerContextType {
  // ✅ Manager를 노출
  hashManager: WorkerManager | null;
  analysisManager: WorkerManager | null;
  chunkWorker: Worker | null;
  isWasmReady: boolean;
  getWorkerCache: (key: TabKey) => WorkerCacheData | undefined;
  setWorkerCache: (key: TabKey, data: WorkerCacheData) => void;
  deleteWorkerCache: (key: TabKey) => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cacheRef = useRef<Map<TabKey, WorkerCacheData>>(new Map());
  const hashManagerRef = useRef<WorkerManager | null>(null);
  const analysisManagerRef = useRef<WorkerManager | null>(null);
  const chunkWorkerRef = useRef<Worker | null>(null);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const { startProcessing, stopProcessing } = useProcess();

  useEffect(() => {
    startProcessing();
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

      // 2️⃣ 생성된 워커를 Manager에게 "주입"
      hashManagerRef.current = new WorkerManager(hashWorker);
      analysisManagerRef.current = new WorkerManager(analysisWorker);
      chunkWorkerRef.current = chunkWorker;

      // ✅ WASM 초기화 시작 (Worker 생성 직후)
      analysisWorker.postMessage({ type: 'RELOAD_WASM' });

      // WASM 준비 이벤트 구독
      analysisManagerRef.current.events.on('WASM_READY', () => {
        setIsWasmReady(true);
        stopProcessing();
        eventBus.emit('toast', { code: 'WASM_LOADED_SUCCESS' });
      });

      // 전체 진행률을 전역으로도 전달 (헤더/글로벌 프로그레스 바)
      hashManagerRef.current.events.on('PROGRESS', (data: any) => {
        eventBus.emit('progress', data);
      });
      analysisManagerRef.current.events.on('PROGRESS', (data: any) => {
        eventBus.emit('progress', data);
      });

      // 전역 에러 구독 (Toast 연결)
      const handleError = (err: { code: string; message: string }) => {
        if (err.code === 'WASM_ERROR') {
          setIsWasmReady(false);
          stopProcessing();
        }
        eventBus.emit('toast', {
          code: err.code,
          customMessage: err.message,
        });
      };

      hashManagerRef.current.events.on('ERROR', handleError);
      analysisManagerRef.current.events.on('ERROR', handleError);

      chunkWorker.onerror = (event) => {
        console.error('[Chunk Worker] Error:', event.message);
        eventBus.emit('toast', {
          code: 'CHUNK_WORKER_ERROR',
          customMessage: event.message,
        });
      };

      return () => {
        hashManagerRef.current?.terminate();
        analysisManagerRef.current?.terminate();
        chunkWorkerRef.current?.terminate();
      };
    } catch (error) {
      console.error('[WorkerContext] ❌ Failed to create worker:', error);
      stopProcessing();
      eventBus.emit('toast', {
        code: 'WORKER_INIT_FAILED',
        customMessage: (error as Error).message,
      });
    }
  }, [startProcessing, stopProcessing]);

  const getWorkerCache = useCallback(
    (key: TabKey) => cacheRef.current.get(key),
    []
  );

  const setWorkerCache = useCallback((key: TabKey, data: WorkerCacheData) => {
    cacheRef.current.set(key, data);
  }, []);

  const deleteWorkerCache = useCallback((key: TabKey) => {
    const cache = cacheRef.current.get(key);
    if (cache?.cleanup) cache.cleanup();
    cacheRef.current.delete(key);
  }, []);

  const value = useMemo(
    () => ({
      hashManager: hashManagerRef.current,
      analysisManager: analysisManagerRef.current,
      chunkWorker: chunkWorkerRef.current,
      isWasmReady,
      getWorkerCache,
      setWorkerCache,
      deleteWorkerCache,
    }),
    [isWasmReady, getWorkerCache, setWorkerCache, deleteWorkerCache]
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
