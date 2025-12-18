import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useMemo,
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
  processInfo: ProcessInfo;
  setProcessInfo: Dispatch<SetStateAction<ProcessInfo>>;
  isProcessing: boolean;
  isSuccess: boolean;
  isFailure: boolean;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const value = useMemo(
    () => ({
      processInfo,
      setProcessInfo,
      isProcessing,
      isSuccess,
      isFailure,
    }),
    [processInfo, isProcessing, isSuccess, isFailure]
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
