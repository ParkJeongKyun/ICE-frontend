import React from 'react';
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  CloseBtn,
} from './index.styles';
import XIcon from '../Icons/XIcon';

export interface ModalProps {
  title?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <div>{title}</div>
          <CloseBtn onClick={onClose}>
            <XIcon height={20} width={20} />
          </CloseBtn>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;
