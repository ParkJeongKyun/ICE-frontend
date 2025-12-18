import { isMobile } from 'react-device-detect';
/**
 * HexViewer 관련 상수
 */

// 청크 크기 (256KB)
export const CHUNK_SIZE = 256 * 1024;

// EXIF 읽기 크기 (256KB)
export const EXIF_READ_SIZE = 256 * 1024;

// 복사 최대 크기 (256KB)
export const MAX_COPY_SIZE = 256 * 1024;

// 청크 복사 크기 (100KB)
export const COPY_CHUNK_SIZE = 100000;

// 업데이트 간격 (ms)
export const UPDATE_INTERVAL = 50;

// Debounce 시간 (ms)
export const CHUNK_REQUEST_DEBOUNCE = 50;

// 데스크톱 레이아웃
export const DESKTOP_LAYOUT = {
  containerPadding: 10,
  gap: 10,
  bytesPerRow: 16,
  rowHeight: 22,
  headerHeight: 22,
  font: '14px monospace',
  offsetWidth: 75,
  hexByteWidth: 26,
  asciiCharWidth: 12,
} as const;

// 모바일 레이아웃
export const MOBILE_LAYOUT = {
  containerPadding: 5,
  gap: 4,
  bytesPerRow: 16,
  rowHeight: 15,
  headerHeight: 15,
  font: '9px monospace',
  offsetWidth: 44,
  hexByteWidth: 14,
  asciiCharWidth: 7,
} as const;

// 현재 레이아웃
export const LAYOUT = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

// 계산된 위치
export const OFFSET_START_X = LAYOUT.containerPadding;
export const HEX_START_X = OFFSET_START_X + LAYOUT.offsetWidth + LAYOUT.gap;
export const ASCII_START_X =
  HEX_START_X + LAYOUT.bytesPerRow * LAYOUT.hexByteWidth + LAYOUT.gap;

// 최소 너비
export const MIN_HEX_WIDTH =
  LAYOUT.containerPadding * 2 +
  LAYOUT.offsetWidth +
  LAYOUT.gap * 2 +
  LAYOUT.bytesPerRow * LAYOUT.hexByteWidth +
  LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth;

// 색상 키
export const COLOR_KEYS = {
  HEX_EVEN: '--main-color_1',
  HEX_ODD: '--main-color',
  ASCII: '--main-color',
  ASCII_DISABLED: '--main-disabled-color',
  SELECTED_BG: '--main-hover-color',
  SELECTED_TEXT: '--ice-main-color',
  OFFSET: '--ice-main-color_5',
  BG: '--main-bg-color',
} as const;

// 기본 색상
export const DEFAULT_COLORS = {
  HEX_EVEN: '#a0c0d8',
  HEX_ODD: '#d8e8f0',
  ASCII: '#d8e8f0',
  ASCII_DISABLED: '#3a4754',
  SELECTED_BG: '#243240',
  SELECTED_TEXT: '#60c8ff',
  OFFSET: '#d8f0ff',
  BG: '#1a1f28',
} as const;
