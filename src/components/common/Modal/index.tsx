import React, { useCallback } from 'react';
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
  top = '50%',
  left = '50%',
}) => {
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    []
  );

  if (!isOpen) return null;

  return (
    <ModalContainer $isOpen={isOpen} onClick={handleContainerClick}>
      <ModalContent $top={top} $left={left} onClick={handleContentClick}>
        <ModalHeader>
          <div>{title}</div>
          {onClose && (
            <CloseBtn onClick={onClose} aria-label="닫기">
              <XIcon height={20} width={20} />
            </CloseBtn>
          )}
        </ModalHeader>
        <ChildDiv>{children}</ChildDiv>
      </ModalContent>
    </ModalContainer>
  );
};

export default React.memo(Modal);
