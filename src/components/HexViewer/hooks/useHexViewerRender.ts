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
  headerCanvasRef: RefObject<HTMLCanvasElement>;
  firstRowRef: React.MutableRefObject<number>;
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
  }>;
  encodingRef: React.MutableRefObject<EncodingType>;
  canvasSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  isInitialLoadingRef: React.MutableRefObject<boolean>;
  hasValidDataRef: React.MutableRefObject<boolean>;
}

export const useHexViewerRender = ({
  canvasRef,
  headerCanvasRef,
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

  const renderHeader = useCallback(() => {
    const headerCanvas = headerCanvasRef.current;
    if (!headerCanvas || !colorsRef.current) return;

    const ctx = headerCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const colors = colorsRef.current;
    const dpr = getDevicePixelRatio();
    const currentCanvasSize = canvasSizeRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = colors.BG;
    ctx.fillRect(0, 0, currentCanvasSize.width, LAYOUT.headerHeight);

    ctx.save();
    ctx.scale(dpr, 1);
    ctx.font = LAYOUT.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.OFFSET;

    // Offset 헤더
    ctx.fillText(
      'Offset(h)',
      OFFSET_START_X + LAYOUT.offsetWidth / 2,
      LAYOUT.headerHeight / 2
    );

    // HEX 헤더 (00 01 02 ... 0F)
    for (let i = 0; i < LAYOUT.bytesPerRow; i++) {
      const x = HEX_START_X + i * LAYOUT.hexByteWidth + LAYOUT.hexByteWidth / 2;
      ctx.fillText(
        i.toString(16).padStart(2, '0').toUpperCase(),
        x,
        LAYOUT.headerHeight / 2
      );
    }

    // ASCII 헤더
    const asciiHeaderX = ASCII_START_X + (LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth) / 2;
    ctx.fillText('Decoded text', asciiHeaderX, LAYOUT.headerHeight / 2);

    ctx.restore();
  }, [headerCanvasRef, colorsRef, canvasSizeRef]);

  const directRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx || !colorsRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offscreenCanvas = offscreenCanvasRef.current;
    const currentCanvasSize = canvasSizeRef.current;
    
    const renderHeight = currentCanvasSize.height - LAYOUT.headerHeight;

    if (
      offscreenCanvas.width !== currentCanvasSize.width ||
      offscreenCanvas.height !== renderHeight
    ) {
      offscreenCanvas.width = currentCanvasSize.width;
      offscreenCanvas.height = renderHeight;
    }

    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offCtx) return;

    const colors = colorsRef.current;
    const dpr = getDevicePixelRatio();

    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = colors.BG;
    offCtx.fillRect(0, 0, currentCanvasSize.width, renderHeight);

    // ✅ 파일 사이즈가 0인 경우 첫 번째 오프셋만 표시
    if (fileSize === 0) {
      offCtx.save();
      offCtx.scale(dpr, 1);
      offCtx.font = LAYOUT.font;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      // 첫 번째 오프셋 표시
      offCtx.fillStyle = colors.OFFSET;
      offCtx.fillText(
        '00000000',
        OFFSET_START_X + LAYOUT.offsetWidth / 2,
        LAYOUT.rowHeight / 2
      );

      offCtx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreenCanvas, 0, 0);
      hasValidDataRef.current = true;
      return;
    }

    offCtx.save();
    offCtx.scale(dpr, 1);
    offCtx.font = LAYOUT.font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const renderRows = Math.ceil(renderHeight / LAYOUT.rowHeight) + 1;
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

      offCtx.fillStyle = colors.OFFSET;
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

        // HEX 영역
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

        // ASCII 영역
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

  return { directRender, renderHeader };
};
