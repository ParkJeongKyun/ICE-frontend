import React, { useCallback, useMemo } from 'react';
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
  border-bottom: 1px solid #ccc;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: ${(props) => (props.active ? '2px solid #1890ff' : 'none')};
  color: ${(props) => (props.active ? '#1890ff' : '#000')};
  &:hover {
    color: #1890ff;
  }
`;

const TabContentContainer = styled.div`
  flex-grow: 1; // 남는 부분을 전부 차지
  padding: 20px;
  border: 1px solid #ccc;
  border-top: none;
  overflow: auto; // 콘텐츠가 많을 경우 스크롤
`;

// TabWindow 컴포넌트
const TabWindow: React.FC<Props> = ({ items, activeKey, setActiveKey }) => {
  const handleTabClick = useCallback(
    (key: TabKey) => {
      setActiveKey(key);
    },
    [setActiveKey]
  );

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeKey),
    [items, activeKey]
  );

  return (
    <TabWindowContainer>
      <TabsContainer>
        {items.map((item) => (
          <Tab
            key={item.key}
            active={item.key === activeKey}
            onClick={() => handleTabClick(item.key)}
          >
            {item.label}
          </Tab>
        ))}
      </TabsContainer>
      <TabContentContainer>{activeItem?.children}</TabContentContainer>
    </TabWindowContainer>
  );
};

export default React.memo(TabWindow);
