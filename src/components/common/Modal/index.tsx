import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import { useRefs } from '@/contexts/RefContext';

export interface ModalProps {
  title?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  top?: string;
  left?: string;
}

export interface ModalRef {
  open: (title?: React.ReactNode, content?: React.ReactNode) => void;
  close: () => void;
}

const Modal: React.FC<ModalProps> = ({ title: propTitle, isOpen: propIsOpen, onClose, children: propChildren, top = '50%', left = '50%' }) => {
    const { t } = useTranslation();
    const { setModalRef } = useRefs();

    const [isOpen, setIsOpen] = useState<boolean>(propIsOpen ?? false);
    const [title, setTitle] = useState<React.ReactNode | undefined>(propTitle);
    const [content, setContent] = useState<React.ReactNode | undefined>(propChildren);

    // Keep controlled prop sync if parent passes isOpen
    useEffect(() => {
      if (propIsOpen !== undefined) setIsOpen(propIsOpen);
    }, [propIsOpen]);

    useEffect(() => {
      if (propTitle !== undefined) setTitle(propTitle);
    }, [propTitle]);

    useEffect(() => {
      if (propChildren !== undefined) setContent(propChildren);
    }, [propChildren]);

    const open = useCallback((newTitle?: React.ReactNode, newContent?: React.ReactNode) => {
      if (newTitle !== undefined) setTitle(newTitle);
      if (newContent !== undefined) setContent(newContent);
      setIsOpen(true);
    }, []);

    const close = useCallback(() => {
      setIsOpen(false);
      onClose?.();
    }, [onClose]);

    const methods = useMemo(() => ({ open, close }), [open, close]);

    // register modal methods into RefContext
    useEffect(() => {
      if (setModalRef) {
        setModalRef(methods);
        return () => setModalRef(null);
      }
      return undefined;
    }, [setModalRef, methods]);

    const handleContainerClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
          onClose?.();
        }
      },
      [onClose]
    );

    const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    }, []);

    if (!isOpen) return null;

    return (
      <ModalContainer $isOpen={isOpen} onClick={handleContainerClick}>
        <ModalContent $top={top} $left={left} onClick={handleContentClick}>
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <Tooltip text={t('notifications.close')}>
              <CloseBtn
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
              >
                <XIcon width={14} height={14} />
              </CloseBtn>
            </Tooltip>
          </ModalHeader>
          <ChildDiv>{content}</ChildDiv>
        </ModalContent>
      </ModalContainer>
    );
  };

export default React.memo(Modal);
