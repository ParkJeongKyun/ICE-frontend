import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelection, useTab } from '@/contexts/TabDataContext/TabDataContext';
import eventBus from '@/types/eventBus';
import {
  SelectLabel,
  SelectValue,
  IceCopyRight,
} from '@/layouts/MainLayout/MainLayout.styles';

const SelectionDisplay: React.FC = React.memo(() => {
  const t = useTranslations();
  const { activeKey } = useTab();
  const { activeSelectionState } = useSelection();
  const [previewRange, setPreviewRange] = useState<{
    start: number | null;
    end: number | null;
    cursor: number | null;
  } | null>(null);

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

  const currentSelection = previewRange || activeSelectionState;

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

  const showHex = (decimal: number) => (
    <SelectValue>
      {decimal}
      <SelectValue as="span">
        (0x{decimal.toString(16).toUpperCase()})
      </SelectValue>
    </SelectValue>
  );

  if (!selectionInfo) {
    return <IceCopyRight>{t('copyright')}</IceCopyRight>;
  }

  return (
    <>
      <div>
        <SelectLabel>{t('footer.selection')}:</SelectLabel>
        {showHex(selectionInfo.length)}
      </div>
      <div>
        <SelectLabel>{t('footer.offset')}:</SelectLabel>
        {showHex(selectionInfo.minOffset)}
      </div>
      <div>
        <SelectLabel>{t('footer.range')}:</SelectLabel>
        {showHex(selectionInfo.minOffset)}-{showHex(selectionInfo.maxOffset)}
      </div>
    </>
  );
});

export default SelectionDisplay;
