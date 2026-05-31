'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelection, useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { getRadix, getOffsetPrefix } from '@/utils/formatters';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import XIcon from '@/components/common/Icons/XIcon';
import {
  SelectionModalOverlay,
  SelectionModalBox,
  SelectionModalHeader,
  SelectionModalTitle,
  SelectionModalBody,
  SelectionModalClose,
  SelectionModalActions,
  SelectionModalInput,
  SelectionModalButton,
  SelectionModeGroup,
  SelectionModeButton,
  SelectionModalGrid,
  SelectionRow,
  SelectionRowLabel,
  SelectionRowInput,
  SelectionRadixButton,
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
  const { config, updateConfig } = useConfig();
  const { activeData } = useTab();
  const { activeSelectionState } = useSelection();
  const { hexViewerRef } = useRefs();

  const fileSize = activeData?.file?.size || 0;
  const radix = getRadix(config.ui.numberBase);
  const radixLabel = getOffsetPrefix(config.ui.numberBase);

  const [mode, setMode] = useState<'range' | 'length'>('length');
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('0');
  const [length, setLength] = useState('1');

  const toggleRadix = () => {
    const bases = ['hexadecimal', 'decimal', 'octal', 'binary'] as const;
    const currentIndex = bases.indexOf(config.ui.numberBase);
    const nextIndex = (currentIndex + 1) % bases.length;
    updateConfig({ ui: { ...config.ui, numberBase: bases[nextIndex] } });
  };

  const toRadixString = useCallback(
    (value: number) => value.toString(radix).toUpperCase(),
    [radix]
  );
  const parseByRadix = useCallback(
    (value: string) => parseInt(value, radix),
    [radix]
  );

  useEffect(() => {
    if (!isOpen) return;

    const currentStart = activeSelectionState.start ?? 0;
    const currentEnd = activeSelectionState.end ?? 0;
    const minSelection = Math.min(currentStart, currentEnd);
    const maxSelection = Math.max(currentStart, currentEnd);

    setStart(toRadixString(minSelection));
    setEnd(toRadixString(maxSelection));
    setLength(toRadixString(Math.max(1, maxSelection - minSelection + 1)));
  }, [
    isOpen,
    activeSelectionState.start,
    activeSelectionState.end,
    radix,
    toRadixString,
  ]);

  if (!isOpen) return null;

  const handleApply = () => {
    const parsedStart = parseByRadix(start);
    if (Number.isNaN(parsedStart) || parsedStart < 0) return;

    let parsedEnd = parsedStart;
    if (mode === 'range') {
      parsedEnd = parseByRadix(end);
      if (Number.isNaN(parsedEnd) || parsedEnd < 0) return;
    } else {
      const parsedLength = parseByRadix(length);
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
              $active={mode === 'length'}
              onClick={() => setMode('length')}
            >
              {t('selectionEditor.lengthMode')}
            </SelectionModeButton>
            <SelectionModeButton
              $active={mode === 'range'}
              onClick={() => setMode('range')}
            >
              {t('selectionEditor.rangeMode')}
            </SelectionModeButton>
          </SelectionModeGroup>

          <SelectionModalGrid>
            <SelectionRow>
              <SelectionRowLabel>
                {t('selectionEditor.startOffset')}
              </SelectionRowLabel>
              <SelectionRowInput>
                <SelectionRadixButton onClick={toggleRadix}>
                  {radixLabel}
                </SelectionRadixButton>
                <SelectionModalInput
                  type="text"
                  value={start}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleaned =
                      radix === 16
                        ? val.replace(/[^0-9a-fA-F]/g, '')
                        : radix === 10
                          ? val.replace(/[^0-9]/g, '')
                          : radix === 8
                            ? val.replace(/[^0-7]/g, '')
                            : val.replace(/[^0-1]/g, '');
                    setStart(cleaned);
                  }}
                />
              </SelectionRowInput>
            </SelectionRow>

            {mode === 'range' ? (
              <SelectionRow>
                <SelectionRowLabel>
                  {t('selectionEditor.endOffset')}
                </SelectionRowLabel>
                <SelectionRowInput>
                  <SelectionRadixButton onClick={toggleRadix}>
                    {radixLabel}
                  </SelectionRadixButton>
                  <SelectionModalInput
                    type="text"
                    value={end}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleaned =
                        radix === 16
                          ? val.replace(/[^0-9a-fA-F]/g, '')
                          : radix === 10
                            ? val.replace(/[^0-9]/g, '')
                            : radix === 8
                              ? val.replace(/[^0-7]/g, '')
                              : val.replace(/[^0-1]/g, '');
                      setEnd(cleaned);
                    }}
                  />
                </SelectionRowInput>
              </SelectionRow>
            ) : (
              <SelectionRow>
                <SelectionRowLabel>
                  {t('selectionEditor.length')}
                </SelectionRowLabel>
                <SelectionRowInput>
                  <SelectionRadixButton onClick={toggleRadix}>
                    {radixLabel}
                  </SelectionRadixButton>
                  <SelectionModalInput
                    type="text"
                    value={length}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleaned =
                        radix === 16
                          ? val.replace(/[^0-9a-fA-F]/g, '')
                          : radix === 10
                            ? val.replace(/[^0-9]/g, '')
                            : radix === 8
                              ? val.replace(/[^0-7]/g, '')
                              : val.replace(/[^0-1]/g, '');
                      setLength(cleaned);
                    }}
                  />
                </SelectionRowInput>
              </SelectionRow>
            )}
          </SelectionModalGrid>

          <SelectionModalActions>
            <SelectionModalButton type="button" onClick={handleApply}>
              {t('common.confirm')}
            </SelectionModalButton>
          </SelectionModalActions>
        </SelectionModalBody>
      </SelectionModalBox>
    </SelectionModalOverlay>
  );
};

export default React.memo(SelectionEditorModal);
