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
import { useMessage } from '@/contexts/MessageContext';

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
  const { showError } = useMessage();

  useEffect(() => {
    startProcessing();
    try {
      const newFileWorker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );

      newFileWorker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const { type } = e.data;

        if (type === 'WASM_READY') {
          console.log('[WorkerContext] ✅ WASM is ready!');
          setIsWasmReady(true);
          stopProcessing();
        } else if (type === 'WASM_ERROR') {
          console.error('[WorkerContext] ❌ WASM load failed:', e.data.error);
          setIsWasmReady(false);
          stopProcessing();
          showError('WASM_LOAD_FAILED', e.data.error);
        } else if (type === 'ERROR' && e.data.errorCode) {
          showError(e.data.errorCode, e.data.error);
        }
      };

      newFileWorker.onerror = (error) => {
        console.error('[WorkerContext] ❌ Worker error:', error.message);
        setIsWasmReady(false);
        stopProcessing();
        showError('WORKER_ERROR', error.message);
      };

      setFileWorker(newFileWorker);

      return () => {
        newFileWorker.terminate();
        stopProcessing();
      };
    } catch (error) {
      console.error('[WorkerContext] ❌ Failed to create worker:', error);
      stopProcessing();
      showError('WORKER_INIT_FAILED', (error as Error).message);
    }
  }, [startProcessing, stopProcessing, showError]);

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
