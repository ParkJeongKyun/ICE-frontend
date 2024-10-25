import React, { useCallback, useMemo, useRef } from 'react';
import {
  CloseBtn,
  Tab,
  TabContentContainer,
  TabWindowContainer,
  TabsContainer,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import { TabItem, TabKey } from '@/types';
import { useSelection } from '@/contexts/SelectionContext';
import { useTabData } from '@/contexts/TabDataContext';

interface Props {
  items: TabItem[];
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
}

// TabWindow 컴포넌트
const TabWindow: React.FC<Props> = ({ items, setItems }) => {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const { setTabData, activeKey, setActiveKey } = useTabData();
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
          let newActiveKey: TabKey | number;
          if (index === 0) {
            // 첫 번째 탭이 제거된 경우
            newActiveKey = newItems[0]?.key || 0;
          } else {
            // 그 외의 경우
            newActiveKey =
              newItems[index - 1]?.key ||
              newItems[newItems.length - 1]?.key ||
              0;
          }
          setActiveKey(newActiveKey);
        }

        // Datas에서도 제거
        setTabData((prevDatas) => {
          const { [key]: _, ...newDatas } = prevDatas;
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
    [activeKey, items, setActiveKey, setTabData, setItems]
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
