import React, { useState } from 'react';
import {
  CollapsIconDiv,
  CollapseContainer,
  CollapseContent,
  CollapseHeader,
  Title,
} from './Collapse.styles';
import MinusIcon from '@/components/common/Icons/MinusIcon';
import PlusIcon from '@/components/common/Icons/PlusIcon';

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  removePadding?: boolean;
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
          {children}
        </CollapseContent>
      )}
    </CollapseContainer>
  );
};

export default Collapse;
