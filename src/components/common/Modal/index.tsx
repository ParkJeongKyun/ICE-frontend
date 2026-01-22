import React, { useCallback } from 'react';
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  CloseBtn,
  ChildDiv,
  ModalTitle,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import Tooltip from '../Tooltip';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          <ModalTitle>{title}</ModalTitle>
          {onClose && (
            <Tooltip text={t('notifications.close')}>
              <CloseBtn onClick={onClose}>
                <XIcon width={14} height={14} />
              </CloseBtn>
            </Tooltip>
          )}
        </ModalHeader>
        <ChildDiv>{children}</ChildDiv>
      </ModalContent>
    </ModalContainer>
  );
};

export default React.memo(Modal);
