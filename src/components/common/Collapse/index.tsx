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
}

const Collapse: React.FC<CollapseProps> = ({ title, children, open }) => {
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
      {isOpen && <CollapseContent>{children}</CollapseContent>}
    </CollapseContainer>
  );
};
export default Collapse;
