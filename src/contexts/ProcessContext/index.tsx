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

export type ProcessType = 'Exif' | 'Yara';
export type ProcessStatus = 'idle' | 'processing' | 'success' | 'failure';

interface ProcessInfo {
  fileName?: string;
  type?: ProcessType;
  status: ProcessStatus;
  message?: string;
}

interface ProcessContextType {
  worker: Worker | null;
  result: string[];
  processInfo: ProcessInfo;
  setProcessInfo: Dispatch<SetStateAction<ProcessInfo>>;
  isProcessing: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  testYara: (inputRule: any, binaryData: Uint8Array) => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [worker, setWorker] = useState<Worker | null>(null);
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

  useEffect(() => {
    const newWorker = new Worker(
      new URL('/worker/yara_worker.js', import.meta.url)
    );
    newWorker.onmessage = (e) => {
      const { status, matchedRuleNames, message } = e.data;
      if (status === 'success') {
        setResult(matchedRuleNames);
        setProcessInfo({ status: 'success', message: '' });
      } else if (status === 'failure') {
        setResult([]);
        setProcessInfo({ status: 'failure', message });
      }
    };
    newWorker.onerror = (e) => {
      setResult([]);
      setProcessInfo({ status: 'failure', message: e.message });
    };
    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, []);

  const testYara = useCallback(
    (inputRule: any, binaryData: Uint8Array) => {
      setProcessInfo({ status: 'processing' });
      if (worker) {
        const clonedData = binaryData.slice(0);
        worker.postMessage(
          {
            binaryData: clonedData,
            inputRule,
          },
          [clonedData.buffer]
        );
      }
    },
    [worker, setProcessInfo]
  );

  const value = useMemo(
    () => ({
      worker,
      result,
      processInfo,
      setProcessInfo,
      isProcessing,
      isSuccess,
      isFailure,
      testYara,
    }),
    [worker, result, processInfo, isProcessing, isSuccess, isFailure, testYara]
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
