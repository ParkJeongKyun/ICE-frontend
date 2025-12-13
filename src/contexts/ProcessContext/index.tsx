import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useMemo,
  useEffect,
} from 'react';

export type ProcessType = 'Exif' | 'Hex' | 'Ascii';
export type ProcessStatus = 'idle' | 'processing' | 'success' | 'failure';

interface ProcessInfo {
  fileName?: string;
  type?: ProcessType;
  status: ProcessStatus;
  message?: string;
}

interface ProcessContextType {
  fileWorker: Worker | null;
  result: string[];
  processInfo: ProcessInfo;
  setProcessInfo: Dispatch<SetStateAction<ProcessInfo>>;
  isProcessing: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  isWasmReady: boolean;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileWorker, setFileWorker] = useState<Worker | null>(null);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [processInfo, setProcessInfo] = useState<ProcessInfo>({
    status: 'idle',
  });

  const isProcessing = useMemo(
    () => processInfo.status === 'processing',
    [processInfo.status]
  );
  const isSuccess = useMemo(
    () => processInfo.status === 'success',
    [processInfo.status]
  );
  const isFailure = useMemo(
    () => processInfo.status === 'failure',
    [processInfo.status]
  );

  // 메인 스레드에서는 WASM 로드하지 않음
  console.log('[Main] All WASM operations are handled by Worker');

  useEffect(() => {
    try {
      const newFileWorker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );

      newFileWorker.onmessage = (e) => {
        const { type } = e.data;

        if (type === 'WASM_READY') {
          console.log('[ProcessContext] ✅ WASM is ready!');
          setIsWasmReady(true);
        } else if (type === 'WASM_ERROR') {
          console.error('[ProcessContext] ❌ WASM load failed:', e.data.error);
          setIsWasmReady(false);
        }
      };

      newFileWorker.onerror = (error) => {
        console.error('[ProcessContext] ❌ Worker error:', error.message);
        setIsWasmReady(false);
      };

      setFileWorker(newFileWorker);

      return () => {
        newFileWorker.terminate();
      };
    } catch (error) {
      console.error('[ProcessContext] ❌ Failed to create worker:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      fileWorker,
      result,
      processInfo,
      setProcessInfo,
      isProcessing,
      isSuccess,
      isFailure,
      isWasmReady,
    }),
    [
      fileWorker,
      result,
      processInfo,
      isProcessing,
      isSuccess,
      isFailure,
      isWasmReady,
    ]
  );

  return (
    <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>
  );
};

export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
};
