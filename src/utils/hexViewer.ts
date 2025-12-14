import { CHUNK_SIZE } from '@/constants/hexViewer';
import { LAYOUT } from '@/constants/hexViewer';

/**
 * Device Pixel Ratio 가져오기
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * 바이트 인덱스를 행/열로 변환
 */
export function indexToRowCol(
  index: number,
  bytesPerRow: number = LAYOUT.bytesPerRow
) {
  return {
    row: Math.floor(index / bytesPerRow),
    col: index % bytesPerRow,
  };
}

/**
 * 행/열을 바이트 인덱스로 변환
 */
export function rowColToIndex(
  row: number,
  col: number,
  bytesPerRow: number = LAYOUT.bytesPerRow
): number {
  return row * bytesPerRow + col;
}

/**
 * 바이트 인덱스에서 청크 오프셋 계산
 */
export function getChunkOffset(byteIndex: number): number {
  return Math.floor(byteIndex / CHUNK_SIZE) * CHUNK_SIZE;
}

/**
 * 청크 내 로컬 인덱스 계산
 */
export function getLocalIndex(byteIndex: number, chunkOffset: number): number {
  return byteIndex - chunkOffset;
}

/**
 * 선택 영역이 특정 행과 겹치는지 확인
 */
export function isRowInSelection(
  rowStart: number,
  rowEnd: number,
  selStart: number | null,
  selEnd: number | null
): boolean {
  if (selStart === null || selEnd === null) return false;
  const minSel = Math.min(selStart, selEnd);
  const maxSel = Math.max(selStart, selEnd);
  return rowStart <= maxSel && rowEnd >= minSel;
}

/**
 * CSS 변수에서 색상 값 가져오기
 */
export function getCSSColor(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}
