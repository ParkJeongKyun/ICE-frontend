import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

interface ProcessContextType {
  isProcessing: boolean;
  progress: number;
  startProcessing: () => void;
  stopProcessing: () => void;
  updateProgress: (progress: number) => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setProgress(0);
  }, []);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const value = useMemo(
    () => ({
      isProcessing,
      progress,
      startProcessing,
      stopProcessing,
      updateProgress,
    }),
    [isProcessing, progress, startProcessing, stopProcessing, updateProgress]
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
