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
import type { WorkerMessage } from '@/types/fileReader.worker';
import { useProcess } from '@/contexts/ProcessContext';
import eventBus from '@/utils/eventBus';

interface WorkerCacheData {
  cache: Map<number, Uint8Array>;
  cleanup: () => void;
}

interface WorkerContextType {
  fileWorker: Worker | null;
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
  const [fileWorker, setFileWorker] = useState<Worker | null>(null);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const { startProcessing, stopProcessing } = useProcess();

  useEffect(() => {
    startProcessing();
    try {
      const newFileWorker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );

      newFileWorker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const { type } = e.data;

        if (type === 'WASM_READY') {
          setIsWasmReady(true);
          stopProcessing();
          eventBus.emit('toast', { code: 'WASM_LOADED_SUCCESS' });
        } else if (type === 'WASM_ERROR') {
          setIsWasmReady(false);
          stopProcessing();
          eventBus.emit('toast', {
            code: 'WASM_LOAD_FAILED',
            customMessage: e.data.error,
          });
        } else if (type === 'ERROR' && e.data.errorCode) {
          eventBus.emit('toast', {
            code: e.data.errorCode,
            customMessage: e.data.error,
          });
        }
      };

      newFileWorker.onerror = (error) => {
        console.error('[WorkerContext] ❌ Worker error:', error.message);
        setIsWasmReady(false);
        stopProcessing();
        eventBus.emit('toast', {
          code: 'WORKER_ERROR',
          customMessage: error.message,
        });
      };

      setFileWorker(newFileWorker);

      return () => {
        newFileWorker.terminate();
        stopProcessing();
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
      fileWorker,
      isWasmReady,
      getWorkerCache,
      setWorkerCache,
      deleteWorkerCache,
    }),
    [fileWorker, isWasmReady, getWorkerCache, setWorkerCache, deleteWorkerCache]
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
