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
import { useSelection } from 'contexts/SelectionContext';

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
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const { setSelectionRange } = useSelection();

  const handleTabClick = useCallback(
    (key: TabKey) => {
      setActiveKey(key);
    },
    [activeKey, setActiveKey]
  );

  const handleTabClose = useCallback(
    (key: TabKey) => {
      const index = items.findIndex((item) => item.key === key);
      if (index !== -1) {
        // 탭을 제거.
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);

        // 삭제된 탭이 활성화된 탭인 경우, 새로운 활성화된 탭을 선택.
        if (key === activeKey) {
          const newActiveKey = newItems[index - 1]?.key || 0;
          setActiveKey(newActiveKey);
        }

        // Datas에서도 제거
        setDatas((prevDatas) => {
          const newDatas = new Map(prevDatas);
          newDatas.delete(key);
          return newDatas;
        });

        // 선택도 비활성화
        if (newItems.length <= 0) {
          setSelectionRange({
            start: null,
            end: null,
            arrayBuffer: null,
          });
        }
      }
    },
    [activeKey, items, setActiveKey, setDatas, setItems]
  );

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeKey),
    [items, activeKey]
  );

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
                $active={item.key === activeKey}
                onClick={(e) => {
                  // 탭 활성화 이벤트 방어
                  e.stopPropagation();
                  // 탭 닫기
                  handleTabClose(item.key);
                }}
              >
                <XIcon height={15} width={15} />
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
