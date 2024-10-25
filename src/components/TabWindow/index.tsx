import React, { useCallback, useMemo, useRef } from 'react';
import {
  CloseBtn,
  Tab,
  TabContentContainer,
  TabWindowContainer,
  TabsContainer,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import { useSelection } from '@/contexts/SelectionContext';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';

// TabWindow 컴포넌트
const TabWindow: React.FC = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const { tabData, setTabData, activeKey, setActiveKey, activeData, isEmpty } =
    useTabData();
  const { setSelectionRange } = useSelection();

  const handleTabClick = useCallback(
    (key: TabKey) => {
      setActiveKey(key);
    },
    [setActiveKey]
  );

  const handleTabClose = useCallback(
    (key: TabKey) => {
      const tabKeys = Object.keys(tabData) as TabKey[];
      const index = tabKeys.indexOf(key);

      // 삭제된 탭이 활성화된 탭인 경우, 새로운 활성화된 탭을 선택.
      if (key === activeKey) {
        let newActiveKey: TabKey;
        if (index === 0) {
          // 첫 번째 탭이 제거된 경우
          newActiveKey = tabKeys[1] || tabKeys[0];
        } else {
          // 그 외의 경우
          newActiveKey =
            tabKeys[index - 1] || tabKeys[tabKeys.length - 1] || tabKeys[0];
        }
        setActiveKey(newActiveKey);
      }

      // Datas에서도 제거
      setTabData((prevDatas) => {
        const { [key]: _, ...newDatas } = prevDatas;
        return newDatas;
      });

      // 선택도 비활성화
      if (Object.keys(tabData).length === 1) {
        setSelectionRange({
          start: null,
          end: null,
          arrayBuffer: null,
        });
      }
    },
    [activeKey, setActiveKey, setTabData, tabData, setSelectionRange]
  );

  return (
    <TabWindowContainer>
      <TabsContainer $empty={isEmpty}>
        {Object.entries(tabData).map(([tabKey, item]) => (
          <div key={tabKey}>
            <Tab
              $active={tabKey === activeKey}
              onClick={() => handleTabClick(tabKey)}
            >
              {item.window.label}
              <CloseBtn
                $active={tabKey === activeKey}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tabKey);
                }}
              >
                <XIcon height={15} width={15} />
              </CloseBtn>
            </Tab>
          </div>
        ))}
      </TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeData?.window.contents}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
