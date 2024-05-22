import React, { useState } from 'react';
import {
  CollapseContainer,
  CollapseContent,
  CollapseHeader,
  Title,
} from './index.styles';

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
        <Title>{title}</Title>
        <div>{isOpen ? '-' : '+'}</div>
      </CollapseHeader>
      {isOpen && <CollapseContent>{children}</CollapseContent>}
    </CollapseContainer>
  );
};
export default Collapse;
