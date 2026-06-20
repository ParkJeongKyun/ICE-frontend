import React, { useState, useCallback } from 'react';
import {
  CollapsIconDiv,
  CollapseContainer,
  CollapseContent,
  CollapseHeader,
  Title,
} from './Collapse.styles';
import MinusIcon from '@/components/common/Icons/MinusIcon';
import PlusIcon from '@/components/common/Icons/PlusIcon';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useCollapseState } from '@/contexts/TabDataContext/TabDataContext';

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  removePadding?: boolean;
  /** 탭별 상태 유지를 위한 고유 id. 지정하면 탭 전환 후에도 열림/닫힘 상태가 보존됩니다. */
  id?: string;
}

const Collapse: React.FC<CollapseProps> = ({
  title,
  children,
  open,
  removePadding,
  id,
}) => {
  // id가 없으면 로컬 상태만 사용 (Tools 패널 등 탭 무관 컴포넌트)
  const [localOpen, setLocalOpen] = useState(open ?? false);

  let contextOpen: boolean | undefined;
  let setContextOpen: ((v: boolean) => void) | undefined;

  // Hooks는 항상 호출해야 하므로 조건부로 사용값만 선택
  const { activeKey } = useTab();
  const { collapseStates, setCollapseOpen } = useCollapseState();

  if (id) {
    const tabCollapseMap = collapseStates[activeKey];
    contextOpen = tabCollapseMap?.[id] ?? open ?? false;
    setContextOpen = (v: boolean) => setCollapseOpen(activeKey, id, v);
  }

  const isOpen = id !== undefined ? contextOpen! : localOpen;

  const toggleCollapse = useCallback(() => {
    if (id !== undefined && setContextOpen) {
      setContextOpen(!isOpen);
    } else {
      setLocalOpen((prev) => !prev);
    }
  }, [id, isOpen, setContextOpen]);

  return (
    <CollapseContainer>
      <CollapseHeader onClick={toggleCollapse}>
        <CollapsIconDiv>
          {isOpen ? (
            <MinusIcon height={13} width={13} color={`var(--main-color)`} />
          ) : (
            <PlusIcon height={13} width={13} color={`var(--main-color)`} />
          )}
        </CollapsIconDiv>
        <Title>{title}</Title>
      </CollapseHeader>
      {isOpen && (
        <CollapseContent $removePadding={removePadding}>
          {children}
        </CollapseContent>
      )}
    </CollapseContainer>
  );
};

export default Collapse;
