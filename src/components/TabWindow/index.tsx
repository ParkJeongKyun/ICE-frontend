import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const {
    tabData,
    setTabData,
    activeKey,
    setActiveKey,
    activeData,
    isEmpty,
    cleanupTab,
    tabOrder,
    reorderTabs,
  } = useTabData();

  // ✅ 드래그 상태 관리
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: 'left' | 'right' } | null>(null);

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

  // ✅ 드래그 핸들러들
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (draggedIndex === null || draggedIndex === index) {
        return;
      }

      // 마우스 위치에 따라 왼쪽/오른쪽 결정
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const position = mouseX < rect.width / 2 ? 'left' : 'right';

      setDropTarget({ index, position });
    },
    [draggedIndex]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      
      if (draggedIndex === null || dropTarget === null) {
        return;
      }

      let targetIndex = dropTarget.index;
      
      // 오른쪽에 드롭하면 다음 인덱스로
      if (dropTarget.position === 'right') {
        targetIndex += 1;
      }

      // 드래그 소스가 타겟보다 앞에 있으면 인덱스 조정
      if (draggedIndex < targetIndex) {
        targetIndex -= 1;
      }

      reorderTabs(draggedIndex, targetIndex);
      setDraggedIndex(null);
      setDropTarget(null);
    },
    [draggedIndex, dropTarget, reorderTabs]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropTarget(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // TabsContainer 영역을 완전히 벗어났을 때만 리셋
    if (e.currentTarget === e.target) {
      setDropTarget(null);
    }
  }, []);

  // ✅ TabsContainer 영역 벗어나면 맨 끝으로 이동
  const handleContainerDragOver = useCallback(
    (e: React.DragEvent) => {
      if (draggedIndex === null) return;

      const container = tabsContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;

      // 왼쪽 영역을 벗어나면 맨 앞으로
      if (mouseX < rect.left) {
        setDropTarget({ index: 0, position: 'left' });
      }
      // 오른쪽 영역을 벗어나면 맨 뒤로
      else if (mouseX > rect.right) {
        setDropTarget({ index: tabOrder.length - 1, position: 'right' });
      }
    },
    [draggedIndex, tabOrder.length]
  );

  const tabContents = useMemo(() => {
    return tabOrder.map((tabKey, index) => {
      const item = tabData[tabKey];
      if (!item) return null;

      const isDragging = draggedIndex === index;
      const showLeftIndicator = dropTarget?.index === index && dropTarget?.position === 'left';
      const showRightIndicator = dropTarget?.index === index && dropTarget?.position === 'right';

      return (
        <div
          key={tabKey}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          style={{
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move',
            position: 'relative',
          }}
        >
          {showLeftIndicator && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '3px',
                height: '100%',
                backgroundColor: 'var(--main-line-color)',
                zIndex: 1000,
              }}
            />
          )}
          {showRightIndicator && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '3px',
                height: '100%',
                backgroundColor: 'var(--main-line-color)',
                zIndex: 1000,
              }}
            />
          )}
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
      );
    });
  }, [
    activeKey,
    handleTabClick,
    handleTabClose,
    tabData,
    tabOrder,
    draggedIndex,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  ]);

  return (
    <TabWindowContainer>
      <TabsContainer 
        ref={tabsContainerRef}
        $empty={isEmpty}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleDragLeave}
      >
        {tabContents}
      </TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeData?.window.contents}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
