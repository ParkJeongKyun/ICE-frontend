import React, { useState } from 'react';
import {
  CollapsIconDiv,
  CollapseContainer,
  CollapseContent,
  CollapseHeader,
  Title,
} from './index.styles';
import MinusIcon from '../Icons/MinusIcon';
import PlusIcon from '../Icons/PlusIcon';

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  removePadding?: boolean; // 새로운 옵션 추가
}

const Collapse: React.FC<CollapseProps> = ({
  title,
  children,
  open,
  removePadding,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

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
          {/* removePadding 옵션 전달 */}
          {children}
        </CollapseContent>
      )}
    </CollapseContainer>
  );
};

export default Collapse;
