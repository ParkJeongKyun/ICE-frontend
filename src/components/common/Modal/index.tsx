import React from 'react';
import { CloseButton, ModalContainer, ModalContent } from './index.styles';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={onClose}>X</CloseButton>
        {children}
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;
