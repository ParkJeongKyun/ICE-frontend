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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    index: number;
    position: 'left' | 'right';
  } | null>(null);
  const lastValidDropTarget = useRef<{
    index: number;
    position: 'left' | 'right';
  } | null>(null);
  const hasDropped = useRef(false);

  const handleTabClick = useCallback(
    (key: TabKey) => {
      setActiveKey(key);
    },
    [setActiveKey]
  );

  const handleTabClose = useCallback(
    (key: TabKey) => {
      const currentIndex = tabOrder.indexOf(key);

      if (key === activeKey && tabOrder.length > 1) {
        const nextIndex = currentIndex === 0 ? 1 : currentIndex - 1;
        setActiveKey(tabOrder[nextIndex]);
      }

      requestIdleCallback(() => cleanupTab(key), { timeout: 100 });

      setTabData((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    },
    [activeKey, tabOrder, setActiveKey, setTabData, cleanupTab]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number, tabKey: TabKey) => {
      setDraggedIndex(index);
      setActiveKey(tabKey);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      hasDropped.current = false;
    },
    [setActiveKey]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (draggedIndex === null || draggedIndex === index) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const position: 'left' | 'right' =
        e.clientX - rect.left < rect.width / 2 ? 'left' : 'right';

      const newTarget = { index, position };
      setDropTarget(newTarget);
      lastValidDropTarget.current = newTarget;
    },
    [draggedIndex]
  );

  const performReorder = useCallback(() => {
    if (draggedIndex === null || !lastValidDropTarget.current) return;

    const { index: dropIdx, position } = lastValidDropTarget.current;
    let targetIdx = position === 'right' ? dropIdx + 1 : dropIdx;
    if (draggedIndex < targetIdx) targetIdx -= 1;

    if (draggedIndex !== targetIdx) {
      reorderTabs(draggedIndex, targetIdx);
    }

    setDraggedIndex(null);
    setDropTarget(null);
    lastValidDropTarget.current = null;
    hasDropped.current = false;
  }, [draggedIndex, reorderTabs]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      hasDropped.current = true;
      performReorder();
    },
    [performReorder]
  );

  const handleDragEnd = useCallback(() => {
    if (!hasDropped.current) {
      performReorder();
    } else {
      setDraggedIndex(null);
      setDropTarget(null);
      lastValidDropTarget.current = null;
      hasDropped.current = false;
    }
  }, [performReorder]);

  const handleGlobalDragOver = useCallback(
    (e: React.DragEvent) => {
      if (draggedIndex === null) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const container = tabsContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;

      if (mouseX < rect.left) {
        const newTarget = { index: 0, position: 'left' as const };
        setDropTarget(newTarget);
        lastValidDropTarget.current = newTarget;
      } else if (mouseX > rect.right) {
        const newTarget = {
          index: tabOrder.length - 1,
          position: 'right' as const,
        };
        setDropTarget(newTarget);
        lastValidDropTarget.current = newTarget;
      }
    },
    [draggedIndex, tabOrder.length]
  );

  const tabContents = useMemo(() => {
    return tabOrder.map((tabKey, index) => {
      const item = tabData[tabKey];
      if (!item) return null;

      const isDragging = draggedIndex === index;
      const showLeftIndicator =
        dropTarget?.index === index && dropTarget.position === 'left';
      const showRightIndicator =
        dropTarget?.index === index && dropTarget.position === 'right';

      return (
        <div
          key={tabKey}
          draggable
          onDragStart={(e) => handleDragStart(e, index, tabKey)}
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
                pointerEvents: 'none',
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
                pointerEvents: 'none',
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
    tabOrder,
    tabData,
    draggedIndex,
    dropTarget,
    activeKey,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTabClick,
    handleTabClose,
  ]);

  return (
    <TabWindowContainer
      onDragOver={handleGlobalDragOver}
      onDrop={handleDrop}
    >
      <TabsContainer ref={tabsContainerRef} $empty={isEmpty}>
        {tabContents}
      </TabsContainer>
      <TabContentContainer ref={contentContainerRef}>
        {activeData?.window.contents}
      </TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
