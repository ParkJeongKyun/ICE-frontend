'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

interface ProcessContextType {
  isProcessing: boolean;
  startProcessing: () => void;
  stopProcessing: () => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // count 기반으로 관리: 0이면 idle, 1 이상이면 작업중
  const [count, setCount] = useState(0);

  // 이탈 방지: 작업 중일 때 beforeunload 이벤트를 걸어둡니다
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (count > 0) {
        e.preventDefault();
        // Some browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [count]);

  const startProcessing = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const stopProcessing = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(
    () => ({
      isProcessing: count > 0,
      startProcessing,
      stopProcessing,
    }),
    [count, startProcessing, stopProcessing]
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
