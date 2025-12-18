import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { TabKey } from '@/types';

interface WorkerCacheData {
  cache: Map<number, Uint8Array>;
  cleanup: () => void;
}

interface WorkerContextType {
  getWorkerCache: (key: TabKey) => WorkerCacheData | undefined;
  setWorkerCache: (key: TabKey, data: WorkerCacheData) => void;
  deleteWorkerCache: (key: TabKey) => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cacheRef = useRef<Map<TabKey, WorkerCacheData>>(new Map());

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
      getWorkerCache,
      setWorkerCache,
      deleteWorkerCache,
    }),
    [getWorkerCache, setWorkerCache, deleteWorkerCache]
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
