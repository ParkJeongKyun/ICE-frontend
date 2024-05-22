import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TabItem, TabKey } from 'layouts';
import styled from 'styled-components';

interface Props {
  items: TabItem[];
  activeKey: TabKey;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
}

// 스타일드 컴포넌트
const TabWindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabsContainer = styled.div`
  display: flex;
`;

const Tab = styled.div<{ $active: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 5px 15px;
  cursor: pointer;
  border-bottom: ${(props) =>
    props.$active ? '2px solid var(--ice-main-color)' : 'none'};
  color: ${(props) =>
    props.$active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

const TabContentContainer = styled.div`
  flex-grow: 1; // 남는 부분을 전부 차지
  padding: 0px;
  overflow: auto; // 콘텐츠가 많을 경우 스크롤
  min-width: 570px;
`;

// TabWindow 컴포넌트
const TabWindow: React.FC<Props> = ({ items, activeKey, setActiveKey }) => {
  const [scrollPositions, setScrollPositions] = useState<Map<TabKey, number>>(
    new Map()
  );
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = useCallback(
    (key: TabKey) => {
      if (contentContainerRef.current) {
        // 현재 탭의 스크롤 위치 저장
        setScrollPositions((prev) =>
          new Map(prev).set(activeKey, contentContainerRef.current!.scrollTop)
        );
      }
      setActiveKey(key);
    },
    [activeKey, setActiveKey]
  );

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeKey),
    [items, activeKey]
  );

  // 스크롤 위치 복원
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop =
        scrollPositions.get(activeKey) || 0;
    }
  }, [activeKey, scrollPositions]);

  return (
    <TabWindowContainer>
      <TabsContainer>
        {items.map((item) => (
          <Tab
            key={item.key}
            $active={item.key === activeKey}
            onClick={() => handleTabClick(item.key)}
          >
            {item.label}
          </Tab>
        ))}
      </TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeItem?.children}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
