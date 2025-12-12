import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

export type ProcessType = 'Exif' | 'Yara' | 'Hex' | 'Ascii';
export type ProcessStatus = 'idle' | 'processing' | 'success' | 'failure';

interface ProcessInfo {
  fileName?: string;
  type?: ProcessType;
  status: ProcessStatus;
  message?: string;
}

interface ProcessContextType {
  fileWorker: Worker | null; // ✅ Worker 직접 노출
  yaraWorker: Worker | null; // ✅ YARA Worker도 노출
  result: string[];
  processInfo: ProcessInfo;
  setProcessInfo: Dispatch<SetStateAction<ProcessInfo>>;
  isProcessing: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  testYara: (inputRule: any, binaryData: Uint8Array) => void;
  isWasmReady: boolean; // ✅ WASM 준비 상태
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileWorker, setFileWorker] = useState<Worker | null>(null);
  const [yaraWorker, setYaraWorker] = useState<Worker | null>(null);
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

      const newYaraWorker = new Worker(
        new URL('../../workers/yara_worker.js', import.meta.url)
      );
      newYaraWorker.onmessage = (e) => {
        const { status, matchedRuleNames, message } = e.data;
        if (status === 'success') {
          setResult(matchedRuleNames);
          setProcessInfo({ status: 'success', message: '' });
        } else if (status === 'failure') {
          setResult([]);
          setProcessInfo({ status: 'failure', message });
        }
      };
      setYaraWorker(newYaraWorker);

      return () => {
        newFileWorker.terminate();
        newYaraWorker.terminate();
      };
    } catch (error) {
      console.error('[ProcessContext] ❌ Failed to create worker:', error);
    }
  }, []);

  const testYara = useCallback(
    (inputRule: any, binaryData: Uint8Array) => {
      setProcessInfo({ status: 'processing' });
      if (yaraWorker) {
        const clonedData = binaryData.slice(0);
        yaraWorker.postMessage(
          {
            binaryData: clonedData,
            inputRule,
          },
          [clonedData.buffer]
        );
      }
    },
    [yaraWorker]
  );

  const value = useMemo(
    () => ({
      fileWorker, // ✅ Worker 직접 제공
      yaraWorker,
      result,
      processInfo,
      setProcessInfo,
      isProcessing,
      isSuccess,
      isFailure,
      testYara,
      isWasmReady,
    }),
    [fileWorker, yaraWorker, result, processInfo, isProcessing, isSuccess, isFailure, testYara, isWasmReady]
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
