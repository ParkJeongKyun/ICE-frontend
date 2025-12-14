import { useRef, useCallback, RefObject } from 'react';
import { getDevicePixelRatio } from '@/utils/hexViewer';
import { byteToHex, byteToChar } from '@/utils/encoding';
import {
  LAYOUT,
  OFFSET_START_X,
  HEX_START_X,
  ASCII_START_X,
} from '@/constants/hexViewer';
import { EncodingType } from '@/contexts/TabDataContext';

interface UseHexViewerRenderProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  firstRowRef: React.MutableRefObject<number>; // ✅ 수정
  colorsRef: RefObject<{
    HEX_EVEN: string;
    HEX_ODD: string;
    ASCII: string;
    ASCII_DISABLED: string;
    SELECTED_BG: string;
    SELECTED_TEXT: string;
    OFFSET: string;
    BG: string;
  } | null>;
  getByte: (index: number) => number | null;
  fileSize: number;
  rowCount: number;
  selectionRangeRef: React.MutableRefObject<{
    start: number | null;
    end: number | null;
  }>; // ✅ 수정
  encodingRef: React.MutableRefObject<EncodingType>; // ✅ string → EncodingType
  canvasSizeRef: React.MutableRefObject<{ width: number; height: number }>; // ✅ 수정
  isInitialLoadingRef: React.MutableRefObject<boolean>; // ✅ 수정
  hasValidDataRef: React.MutableRefObject<boolean>; // ✅ 수정
}

export const useHexViewerRender = ({
  canvasRef,
  firstRowRef,
  colorsRef,
  getByte,
  fileSize,
  rowCount,
  selectionRangeRef,
  encodingRef,
  canvasSizeRef,
  isInitialLoadingRef,
  hasValidDataRef,
}: UseHexViewerRenderProps) => {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const directRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx || !colorsRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offscreenCanvas = offscreenCanvasRef.current;
    const currentCanvasSize = canvasSizeRef.current;

    if (
      offscreenCanvas.width !== currentCanvasSize.width ||
      offscreenCanvas.height !== currentCanvasSize.height
    ) {
      offscreenCanvas.width = currentCanvasSize.width;
      offscreenCanvas.height = currentCanvasSize.height;
    }

    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offCtx) return;

    const colors = colorsRef.current;
    const dpr = getDevicePixelRatio();

    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = colors.BG;
    offCtx.fillRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);
    offCtx.save();
    offCtx.scale(dpr, 1);
    offCtx.font = LAYOUT.font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const renderRows =
      Math.ceil(currentCanvasSize.height / LAYOUT.rowHeight) + 1;
    const currentFirstRow = firstRowRef.current;
    const currentSelectionRange = selectionRangeRef.current;
    const currentEncoding = encodingRef.current;

    let validByteCount = 0;

    for (
      let row = currentFirstRow, drawRow = 0;
      row < Math.min(rowCount, currentFirstRow + renderRows);
      row++, drawRow++
    ) {
      const y = drawRow * LAYOUT.rowHeight;
      const offset = row * LAYOUT.bytesPerRow;
      const offsetStart = row * LAYOUT.bytesPerRow;
      const offsetEnd = Math.min(
        offsetStart + LAYOUT.bytesPerRow - 1,
        fileSize - 1
      );
      const selStart = currentSelectionRange.start;
      const selEnd = currentSelectionRange.end;
      const isOffsetSel =
        selStart !== null &&
        selEnd !== null &&
        offsetStart <= Math.max(selStart, selEnd) &&
        offsetEnd >= Math.min(selStart, selEnd);

      if (isOffsetSel) {
        offCtx.fillStyle = colors.SELECTED_BG;
        offCtx.fillRect(
          OFFSET_START_X,
          y + 2,
          LAYOUT.offsetWidth,
          LAYOUT.rowHeight - 4
        );
        offCtx.fillStyle = colors.SELECTED_TEXT;
      } else {
        offCtx.fillStyle = colors.OFFSET;
      }
      offCtx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        OFFSET_START_X + LAYOUT.offsetWidth / 2,
        y + LAYOUT.rowHeight / 2
      );

      for (let i = 0; i < LAYOUT.bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= fileSize) break;

        const byte = getByte(idx);

        if (byte === null || byte === undefined) {
          const xHex =
            HEX_START_X + i * LAYOUT.hexByteWidth + LAYOUT.hexByteWidth / 2;
          offCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
          offCtx.fillRect(
            xHex - LAYOUT.hexByteWidth / 2 + 1,
            y + 2,
            LAYOUT.hexByteWidth - 2,
            LAYOUT.rowHeight - 4
          );
          const xAsc =
            ASCII_START_X +
            i * LAYOUT.asciiCharWidth +
            LAYOUT.asciiCharWidth / 2;
          offCtx.fillRect(
            xAsc - LAYOUT.asciiCharWidth / 2 + 1,
            y + 2,
            LAYOUT.asciiCharWidth - 2,
            LAYOUT.rowHeight - 4
          );
          continue;
        }

        validByteCount++;

        const isSel =
          selStart !== null &&
          selEnd !== null &&
          idx >= Math.min(selStart, selEnd) &&
          idx <= Math.max(selStart, selEnd);

        const xHex =
          HEX_START_X + i * LAYOUT.hexByteWidth + LAYOUT.hexByteWidth / 2;
        const yHex = y + LAYOUT.rowHeight / 2;
        if (isSel) {
          offCtx.fillStyle = colors.SELECTED_BG;
          offCtx.fillRect(
            xHex - LAYOUT.hexByteWidth / 2 + 1,
            y + 2,
            LAYOUT.hexByteWidth - 2,
            LAYOUT.rowHeight - 4
          );
          offCtx.fillStyle = colors.SELECTED_TEXT;
        } else {
          offCtx.fillStyle = i % 2 === 0 ? colors.HEX_EVEN : colors.HEX_ODD;
        }
        offCtx.fillText(byteToHex(byte), xHex, yHex);

        const xAsc =
          ASCII_START_X + i * LAYOUT.asciiCharWidth + LAYOUT.asciiCharWidth / 2;
        const yAsc = y + LAYOUT.rowHeight / 2;
        const char = byteToChar(byte, currentEncoding);
        if (isSel) {
          offCtx.fillStyle = colors.SELECTED_BG;
          offCtx.fillRect(
            xAsc - LAYOUT.asciiCharWidth / 2 + 1,
            y + 2,
            LAYOUT.asciiCharWidth - 2,
            LAYOUT.rowHeight - 4
          );
          offCtx.fillStyle = colors.SELECTED_TEXT;
        } else {
          offCtx.fillStyle =
            char === '.' ? colors.ASCII_DISABLED : colors.ASCII;
        }
        offCtx.fillText(char, xAsc, yAsc);
      }
    }
    offCtx.restore();

    if (validByteCount > 0 || isInitialLoadingRef.current) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreenCanvas, 0, 0);
      if (validByteCount > 0) hasValidDataRef.current = true;
    }
  }, [
    canvasRef,
    firstRowRef,
    colorsRef,
    getByte,
    fileSize,
    rowCount,
    selectionRangeRef,
    encodingRef,
    canvasSizeRef,
    isInitialLoadingRef,
    hasValidDataRef,
  ]);

  return { directRender };
};
