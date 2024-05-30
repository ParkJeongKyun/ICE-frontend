import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

// 선택된 바이트 범위의 타입 정의
interface SelectionRange {
  start: number | null;
  end: number | null;
  arrayBuffer: ArrayBuffer | null;
}

// 컨텍스트 생성
interface SelectionContextType {
  selectionRange: SelectionRange;
  setSelectionRange: Dispatch<SetStateAction<SelectionRange>>;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

// 컨텍스트 프로바이더 컴포넌트
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    start: null,
    end: null,
    arrayBuffer: null,
  });

  return (
    <SelectionContext.Provider value={{ selectionRange, setSelectionRange }}>
      {children}
    </SelectionContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
