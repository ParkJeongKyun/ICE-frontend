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
import { useTranslations, useLocale } from 'next-intl';
import { useRefs } from '@/contexts/RefContext/RefContext';
import ICEMarkDown from '@/components/markdown';
import Tooltip from '../Tooltip/Tooltip';

export interface ModalProps {
  top?: string;
  left?: string;
}

export interface ModalRef {
  open: (key: string) => void;
  close: () => void;
}

const Modal: React.FC<ModalProps> = ({ top = '50%', left = '50%' }) => {
  const t = useTranslations();
  const locale = useLocale();
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
        childFiles: { relase: 'release', update: 'update' },
      },
      help: {
        title: t('menu.help'),
        file: 'help',
        childFiles: { howToUse: 'howToUse' },
      },
    }),
    [t]
  );

  const open = useCallback(
    async (key: string) => {
      const data = modalData[key as keyof typeof modalData];
      if (!data) return;
      setTitle(data.title);
      // fetch main markdown
      const mainRes = await fetch(
        `/locales/${locale}/markdown/${data.file}.md`
      );
      const mainText = await mainRes.text();
      setContent(mainText);
      // fetch child markdowns
      let childTexts: { [key: string]: string } = {};
      if (data.childFiles) {
        await Promise.all(
          Object.entries(data.childFiles).map(async ([key, fname]) => {
            const res = await fetch(`/locales/${locale}/markdown/${fname}.md`);
            childTexts[key] = await res.text();
          })
        );
      }
      setChildTexts(childTexts);
      setIsOpen(true);
    },
    [modalData, locale]
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
          <Tooltip text={t('notifications.close')}>
            <CloseBtn onClick={() => setIsOpen(false)}>
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
