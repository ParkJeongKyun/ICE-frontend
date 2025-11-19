import React, { useCallback, useMemo, useRef } from 'react';
import {
  CloseBtn,
  Tab,
  TabContentContainer,
  TabWindowContainer,
  TabsContainer,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';

// TabWindow 컴포넌트
const TabWindow: React.FC = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const {
    tabData,
    setTabData,
    activeKey,
    setActiveKey,
    activeData,
    isEmpty,
    cleanupTab,
  } = useTabData();

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

      if (key === activeKey) {
        let newActiveKey: TabKey;
        if (index === 0) {
          newActiveKey = tabKeys[1] || tabKeys[0];
        } else {
          newActiveKey =
            tabKeys[index - 1] || tabKeys[tabKeys.length - 1] || tabKeys[0];
        }
        setActiveKey(newActiveKey);
      }

      // ✅ 탭 cleanup (비동기 처리로 UI 블로킹 방지)
      requestIdleCallback(
        () => {
          cleanupTab(key);
        },
        { timeout: 100 }
      );

      setTabData((prevDatas) => {
        const { [key]: _, ...newDatas } = prevDatas;
        return newDatas;
      });
    },
    [activeKey, setActiveKey, setTabData, tabData, cleanupTab]
  );

  const tabContents = useMemo(() => {
    return Object.entries(tabData).map(([tabKey, item]) => (
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
    ));
  }, [activeKey, handleTabClick, handleTabClose, tabData]);

  return (
    <TabWindowContainer>
      <TabsContainer $empty={isEmpty}>{tabContents}</TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeData?.window.contents}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
