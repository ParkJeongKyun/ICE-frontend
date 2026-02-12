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
  // 해시 워커 상태 (동시 실행 가능)
  isHashProcessing: boolean;
  startHashProcessing: () => void;
  stopHashProcessing: () => void;

  // 분석 워커 상태 (WASM 기반, 순차 실행만 가능)
  isAnalysisProcessing: boolean;
  startAnalysisProcessing: () => void;
  stopAnalysisProcessing: () => void;

  // 전체 상태 (페이지 이탈 방지용)
  isProcessing: boolean;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 해시 워커와 분석 워커를 독립적으로 관리
  const [hashCount, setHashCount] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);

  // 이탈 방지: 작업 중일 때 beforeunload 이벤트를 걸어둡니다
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hashCount > 0 || analysisCount > 0) {
        e.preventDefault();
        // Some browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hashCount, analysisCount]);

  // 해시 워커 콜백
  const startHashProcessing = useCallback(() => {
    setHashCount((c) => c + 1);
  }, []);

  const stopHashProcessing = useCallback(() => {
    setHashCount((c) => Math.max(0, c - 1));
  }, []);

  // 분석 워커 콜백
  const startAnalysisProcessing = useCallback(() => {
    setAnalysisCount((c) => c + 1);
  }, []);

  const stopAnalysisProcessing = useCallback(() => {
    setAnalysisCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(
    () => ({
      isHashProcessing: hashCount > 0,
      startHashProcessing,
      stopHashProcessing,
      isAnalysisProcessing: analysisCount > 0,
      startAnalysisProcessing,
      stopAnalysisProcessing,
      isProcessing: hashCount > 0 || analysisCount > 0,
    }),
    [
      hashCount,
      analysisCount,
      startHashProcessing,
      stopHashProcessing,
      startAnalysisProcessing,
      stopAnalysisProcessing,
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
