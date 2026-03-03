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
const DESKTOP_LAYOUT = {
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
const MOBILE_LAYOUT = {
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

// 컨테이너 너비에 따라 동적 레이아웃 반환
export const getLayoutConfig = (containerWidth: number) => {
  const layout =
    containerWidth > 0 && containerWidth < 768 ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

  const OFFSET_START_X = layout.containerPadding;
  const HEX_START_X = OFFSET_START_X + layout.offsetWidth + layout.gap;
  const ASCII_START_X =
    HEX_START_X + layout.bytesPerRow * layout.hexByteWidth + layout.gap;

  const MIN_HEX_WIDTH =
    layout.containerPadding * 2 +
    layout.offsetWidth +
    layout.gap * 2 +
    layout.bytesPerRow * layout.hexByteWidth +
    layout.bytesPerRow * layout.asciiCharWidth;

  return {
    ...layout,
    OFFSET_START_X,
    HEX_START_X,
    ASCII_START_X,
    MIN_HEX_WIDTH,
  };
};

// 타입 추론용
export type LayoutConfig = ReturnType<typeof getLayoutConfig>;

// 초기값 (측정 전 사용)
export const DEFAULT_LAYOUT = getLayoutConfig(0);

// 색상 키
export const COLOR_KEYS = {
  HEX_EVEN: '--main-color-reverse',
  HEX_ODD: '--main-color',
  ASCII: '--main-color',
  ASCII_DISABLED: '--main-disabled-color',
  SELECTED_BG: '--main-hover-color',
  SELECTED_TEXT: '--ice-main-color',
  OFFSET: '--ice-main-color-reverse',
  BG: '--main-bg-color',
} as const;
