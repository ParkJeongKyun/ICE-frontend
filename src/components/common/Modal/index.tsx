import React from 'react';
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  CloseBtn,
  ChildDiv,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';

export interface ModalProps {
  title?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  top?: string;
  left?: string;
}

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
  top,
  left,
}) => {
  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent $top={top || '50%'} $left={left || '50%'}>
        <ModalHeader>
          <div>{title}</div>
          <CloseBtn onClick={onClose}>
            <XIcon height={20} width={20} />
          </CloseBtn>
        </ModalHeader>
        <ChildDiv>{children}</ChildDiv>
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;
