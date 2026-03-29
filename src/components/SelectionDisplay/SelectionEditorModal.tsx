import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelection, useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import XIcon from '@/components/common/Icons/XIcon';
import {
  SelectionModalOverlay,
  SelectionModalBox,
  SelectionModalHeader,
  SelectionModalTitle,
  SelectionModalBody,
  SelectionModalClose,
  SelectionModalRow,
  SelectionModalActions,
  SelectionModalInput,
  SelectionModalButton,
  SelectionModeGroup,
  SelectionModeButton,
} from './SelectionEditorModal.styles';

interface SelectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectionEditorModal: React.FC<SelectionEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations();
  const { activeData } = useTab();
  const { activeSelectionState } = useSelection();
  const { hexViewerRef } = useRefs();

  const fileSize = activeData?.file?.size || 0;

  const [mode, setMode] = useState<'range' | 'length'>('length');
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('0');
  const [length, setLength] = useState('1');

  useEffect(() => {
    if (!isOpen) return;

    const currentStart = activeSelectionState.start ?? 0;
    const currentEnd = activeSelectionState.end ?? 0;
    const minSelection = Math.min(currentStart, currentEnd);
    const maxSelection = Math.max(currentStart, currentEnd);

    setMode('length');
    setStart(String(minSelection));
    setEnd(String(maxSelection));
    setLength(String(Math.max(1, maxSelection - minSelection + 1)));
  }, [isOpen, activeSelectionState.start, activeSelectionState.end]);

  if (!isOpen) return null;

  const handleApply = () => {
    const parsedStart = Number(start);
    if (Number.isNaN(parsedStart) || parsedStart < 0) return;

    let parsedEnd = parsedStart;
    if (mode === 'range') {
      parsedEnd = Number(end);
      if (Number.isNaN(parsedEnd) || parsedEnd < 0) return;
    } else {
      const parsedLength = Number(length);
      if (Number.isNaN(parsedLength) || parsedLength < 1) return;
      parsedEnd = parsedStart + parsedLength - 1;
    }

    let resultStart = parsedStart;
    let resultEnd = parsedEnd;

    if (resultEnd < resultStart) {
      [resultStart, resultEnd] = [resultEnd, resultStart];
    }

    let clampedStart = resultStart;
    let clampedEnd = resultEnd;

    if (fileSize > 0) {
      clampedStart = Math.max(0, Math.min(clampedStart, fileSize - 1));
      clampedEnd = Math.max(0, Math.min(clampedEnd, fileSize - 1));
    }

    const selectionLength = clampedEnd - clampedStart + 1;
    if (hexViewerRef.current) {
      hexViewerRef.current.scrollToIndex(clampedStart, selectionLength);
    }

    onClose();
  };
  return (
    <SelectionModalOverlay onClick={onClose}>
      <SelectionModalBox onClick={(e) => e.stopPropagation()}>
        <SelectionModalHeader>
          <SelectionModalTitle>
            {t('selectionEditor.title')}
          </SelectionModalTitle>
          <Tooltip text={t('common.close')}>
            <SelectionModalClose
              type="button"
              aria-label={t('common.close')}
              onClick={onClose}
            >
              <XIcon width={14} height={14} />
            </SelectionModalClose>
          </Tooltip>
        </SelectionModalHeader>

        <SelectionModalBody>
          <SelectionModeGroup>
            <SelectionModeButton
              type="button"
              $active={mode === 'length'}
              onClick={() => setMode('length')}
            >
              {t('selectionEditor.lengthMode')}
            </SelectionModeButton>
            <SelectionModeButton
              type="button"
              $active={mode === 'range'}
              onClick={() => setMode('range')}
            >
              {t('selectionEditor.rangeMode')}
            </SelectionModeButton>
          </SelectionModeGroup>

          <SelectionModalRow>
            <label>
              {t('selectionEditor.startOffset')}:
              <SelectionModalInput
                type="number"
                min={0}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
          </SelectionModalRow>

          {mode === 'range' ? (
            <SelectionModalRow>
              <label>
                {t('selectionEditor.endOffset')}:
                <SelectionModalInput
                  type="number"
                  min={0}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </SelectionModalRow>
          ) : (
            <SelectionModalRow>
              <label>
                {t('selectionEditor.length')}:
                <SelectionModalInput
                  type="number"
                  min={1}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </label>
            </SelectionModalRow>
          )}

          <SelectionModalActions>
            <SelectionModalButton type="button" onClick={handleApply}>
              {t('selectionEditor.apply')}
            </SelectionModalButton>
          </SelectionModalActions>
        </SelectionModalBody>
      </SelectionModalBox>
    </SelectionModalOverlay>
  );
};

export default React.memo(SelectionEditorModal);
