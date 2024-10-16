import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

// 선택된 바이트 범위의 타입 정의
interface ProcessInfo {
  fileName?: string;
  isProcessing: boolean;
}

// 컨텍스트 생성
interface ProcessContextType {
  processInfo: ProcessInfo;
  setProcessInfo: Dispatch<SetStateAction<ProcessInfo>>;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [processInfo, setProcessInfo] = useState<ProcessInfo>({
    isProcessing: false,
  });

  return (
    <ProcessContext.Provider value={{ processInfo, setProcessInfo }}>
      {children}
    </ProcessContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
};
