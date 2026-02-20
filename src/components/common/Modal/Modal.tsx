'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  CloseBtn,
  ChildDiv,
  ModalTitle,
} from './Modal.styles';
import XIcon from '@/components/common/Icons/XIcon';
import { useTranslations } from 'next-intl';
import { useRefs } from '@/contexts/RefContext/RefContext';
import ICEMarkDown from '@/components/markdown';
import Tooltip from '../Tooltip/Tooltip';

export interface ModalProps {
  top?: string;
  left?: string;
  // 서버에서 미리 읽어온 마크다운 데이터 (key: filename, value: content)
  markdownData?: { [key: string]: string };
}

export interface ModalRef {
  open: (key: string) => void;
  close: () => void;
}

const Modal: React.FC<ModalProps> = ({
  top = '50%',
  left = '50%',
  markdownData = {},
}) => {
  const t = useTranslations();
  const { setModalRef } = useRefs();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [childTexts, setChildTexts] = useState<{ [key: string]: string }>({});

  // 마크다운 모달 데이터 정의 (필요시 확장)
  const modalData = useMemo(
    () => ({
      about: {
        title: t('menu.about'),
        file: 'about',
        childFiles: {
          howToUse: 'howToUse',
          release: 'release',
          update: 'update',
        },
      },
    }),
    [t]
  );

  const open = useCallback(
    (key: string) => {
      const data = modalData[key as keyof typeof modalData];
      if (!data) return;

      setTitle(data.title);

      // 서버에서 전달된 markdownData에서 바로 콘텐츠를 꺼내 사용합니다.
      setContent(markdownData[data.file] || 'Content not found.');

      const currentChildTexts: { [key: string]: string } = {};
      if (data.childFiles) {
        Object.entries(data.childFiles).forEach(([childKey, fname]) => {
          currentChildTexts[childKey] = markdownData[fname] || '';
        });
      }
      setChildTexts(currentChildTexts);
      setIsOpen(true);
    },
    [modalData, markdownData]
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // register modal methods into RefContext
  useEffect(() => {
    if (setModalRef) {
      setModalRef({ open, close });
      return () => setModalRef(null);
    }
    return undefined;
  }, [setModalRef, open, close]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setIsOpen(false);
      }
    },
    []
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
          <Tooltip text={t('common.close')}>
            <CloseBtn onClick={close}>
              <XIcon width={14} height={14} />
            </CloseBtn>
          </Tooltip>
        </ModalHeader>
        <ChildDiv>
          <ICEMarkDown defaultText={content} childTexts={childTexts} />
        </ChildDiv>
      </ModalContent>
    </ModalContainer>
  );
};

export default React.memo(Modal);
