'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { useSelection, useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import eventBus from '@/types/eventBus';
import {
  SelectLabel,
  SelectValue,
  IceCopyRight,
} from '@/layouts/MainLayout/MainLayout.styles';
import SelectionEditorModal from '@/components/SelectionDisplay/SelectionEditorModal';
import { formatOffset } from '@/utils/formatters';

const SelectionDisplay: React.FC = React.memo(() => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeKey } = useTab();
  const { activeSelectionState } = useSelection();
  const [previewRange, setPreviewRange] = useState<{
    start: number | null;
    end: number | null;
    cursor: number | null;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const endTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePreview = (data: {
      start: number | null;
      end: number | null;
      cursor: number | null;
    }) => {
      if (endTimeoutRef.current !== null) {
        window.clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
      setPreviewRange(data);
    };

    const handleEnd = () => {
      if (endTimeoutRef.current !== null) {
        window.clearTimeout(endTimeoutRef.current);
      }
      endTimeoutRef.current = window.setTimeout(() => {
        setPreviewRange(null);
        endTimeoutRef.current = null;
      }, 100);
    };

    eventBus.on('hexSelectionPreview', handlePreview);
    eventBus.on('hexSelectionUpdate', handlePreview);
    eventBus.on('hexSelectionEnd', handleEnd);

    return () => {
      eventBus.off('hexSelectionPreview', handlePreview);
      eventBus.off('hexSelectionUpdate', handlePreview);
      eventBus.off('hexSelectionEnd', handleEnd);
      if (endTimeoutRef.current !== null) {
        window.clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
    };
  }, [activeKey]);

  useEffect(() => {
    setPreviewRange(null);
  }, [activeKey]);

  useEffect(() => {
    if (activeSelectionState && !activeSelectionState.isDragging) {
      setPreviewRange(null);
    }
  }, [activeSelectionState]);

  const currentSelection = previewRange || activeSelectionState;

  const openEditModal = useCallback(() => {
    if (
      !currentSelection ||
      currentSelection.start === null ||
      currentSelection.end === null
    ) {
      return;
    }

    setIsModalOpen(true);
  }, [currentSelection]);

  const selectionInfo = useMemo(() => {
    if (
      !currentSelection ||
      currentSelection.start === null ||
      currentSelection.start < 0 ||
      currentSelection.end === null ||
      currentSelection.end < 0
    ) {
      return null;
    }

    const minOffset = Math.min(currentSelection.start, currentSelection.end);
    const maxOffset = Math.max(currentSelection.start, currentSelection.end);

    return {
      minOffset,
      maxOffset,
      length: maxOffset - minOffset + 1,
    };
  }, [currentSelection]);

  const showFormatted = (decimal: number) => {
    const formatted = formatOffset(decimal, config.ui.numberBase);
    const match = formatted.match(/^(.*)(\(.*\))$/);
    if (match) {
      return (
        <SelectValue>
          {match[1]}
          <SelectValue as="span">{match[2]}</SelectValue>
        </SelectValue>
      );
    }
    return <SelectValue>{formatted}</SelectValue>;
  };

  if (!selectionInfo) {
    return <IceCopyRight>{t('copyright')}</IceCopyRight>;
  }

  return (
    <>
      <SelectionButton
        role="button"
        onClick={openEditModal}
        aria-label={t('selectionEditor.title')}
      >
        <div>
          <SelectLabel>{t('footer.selection')}:</SelectLabel>
          {showFormatted(selectionInfo.length)}
        </div>
        <div>
          <SelectLabel>{t('footer.offset')}:</SelectLabel>
          {showFormatted(selectionInfo.minOffset)}
        </div>
        <div>
          <SelectLabel>{t('footer.range')}:</SelectLabel>
          {showFormatted(selectionInfo.minOffset)}
          {' - '}
          {showFormatted(selectionInfo.maxOffset)}
        </div>
      </SelectionButton>

      <SelectionEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
});

const SelectionButton = styled.div`
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 6px;
  height: 100%;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--main-hover-color);
  }

  &:focus-visible {
    outline: 2px solid var(--main-hover-color);
    outline-offset: 2px;
  }
`;

export default SelectionDisplay;
