import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CloseBtn,
  Tab,
  TabContentContainer,
  TabWindowContainer,
  TabsContainer,
} from './index.styles';
import XIcon from 'components/common/Icons/XIcon';
import { TabData, TabItem, TabKey } from 'types';

interface Props {
  items: TabItem[];
  activeKey: TabKey;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  setDatas: React.Dispatch<React.SetStateAction<TabData>>;
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
}

// TabWindow 컴포넌트
const TabWindow: React.FC<Props> = ({
  items,
  activeKey,
  setActiveKey,
  setDatas,
  setItems,
}) => {
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

  const handleTabClose = useCallback(
    (key: TabKey) => {
      // 삭제하려는 탭의 인덱스를 찾습니다.
      const index = items.findIndex((item) => item.key === key);
      if (index !== -1) {
        // 탭을 제거합니다.
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);

        // 삭제된 탭이 활성화된 탭인 경우, 새로운 활성화된 탭을 선택합니다.
        if (key === activeKey) {
          const newActiveKey = newItems[index - 1]?.key || 0;
          setActiveKey(newActiveKey);
        }

        // Datas에서도 해당 항목을 제거합니다.
        setDatas((prevDatas) => {
          const newDatas = new Map(prevDatas);
          newDatas.delete(key);
          return newDatas;
        });
      }
    },
    [activeKey, items, setActiveKey, setDatas, setItems]
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
      <TabsContainer $empty={items.length <= 0}>
        {items.map((item) => (
          <div key={item.key}>
            <Tab
              $active={item.key === activeKey}
              onClick={() => handleTabClick(item.key)}
            >
              {item.label}
              <CloseBtn
                onClick={(e) => {
                  // 탭 활성화 이벤트 방어
                  e.stopPropagation();
                  // 탭 닫기
                  handleTabClose(item.key);
                }}
              >
                <XIcon height={13} width={13} />
              </CloseBtn>
            </Tab>
          </div>
        ))}
      </TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeItem?.children}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
