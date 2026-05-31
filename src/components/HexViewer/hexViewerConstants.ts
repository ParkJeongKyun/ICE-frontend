/**
 * HexViewer 관련 상수
 */

// 타입 정의
export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hexadecimal';

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
  offsetCharWidth: 9,
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
  offsetCharWidth: 6,
  hexByteWidth: 14,
  asciiCharWidth: 7,
} as const;

/**
 * 오프셋 최대 너비를 계산하는 순수 함수
 * fileSize와 numberBase에서 "가장 긴 숫자"를 구해 최적의 너비 반환
 * 렌더링 중 동적 계산을 없애 성능 향상
 */
export const calculateOffsetWidth = (
  fileSize: number,
  numberBase: NumberBase,
  offsetCharWidth: number
): number => {
  const maxOffset = Math.max(0, fileSize - 1);

  let radix = 16;
  if (numberBase === 'binary') radix = 2;
  else if (numberBase === 'octal') radix = 8;
  else if (numberBase === 'decimal') radix = 10;

  // 최소 8자리는 유지하고, 그 이상 길어지면 해당 길이 반영
  const maxLength = Math.max(8, maxOffset.toString(radix).length);

  // 문자 너비 × 글자수 (순수 텍스트 너비만 반환)
  return maxLength * offsetCharWidth;
};

/**
 * 동적 레이아웃 설정 함수
 * @param containerWidth - 컨테이너 너비 (픽셀)
 * @param customBytesPerRow - 사용자 설정 바이트 수 (8~64, 기본값 16)
 * @param numberBase - 진수 기준 ('binary', 'octal', 'decimal', 'hexadecimal')
 * @param fileSize - 파일 크기 (오프셋 너비 계산용)
 */
export const getLayoutConfig = (
  containerWidth: number,
  customBytesPerRow: number = 16,
  numberBase: NumberBase = 'hexadecimal',
  fileSize: number = 0
) => {
  const layout =
    containerWidth > 0 && containerWidth < 768 ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

  // 오프셋 너비를 동적으로 계산 (fileSize 기반, 순수 텍스트 너비)
  const offsetWidth = calculateOffsetWidth(
    fileSize,
    numberBase,
    layout.offsetCharWidth
  );

  // 실제 bytesPerRow는 customBytesPerRow 또는 기본값 사용
  const bytesPerRow = Math.max(8, Math.min(64, customBytesPerRow || 16));
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  // 오프셋은 컨테이너 패딩에서 시작
  const OFFSET_START_X = layout.containerPadding;
  // HEX 영역은 오프셋 시작점 + 오프셋 너비 + 간격(gap)에서 시작
  const HEX_START_X = OFFSET_START_X + offsetWidth + layout.gap;
  const ASCII_START_X =
    HEX_START_X + bytesPerRow * layout.hexByteWidth + layout.gap;

  const MIN_HEX_WIDTH =
    layout.containerPadding * 2 +
    offsetWidth +
    layout.gap * 2 +
    bytesPerRow * layout.hexByteWidth +
    bytesPerRow * layout.asciiCharWidth;

  return {
    ...layout,
    offsetWidth,
    bytesPerRow,
    rowCount,
    OFFSET_START_X,
    HEX_START_X,
    ASCII_START_X,
    MIN_HEX_WIDTH,
    numberBase,
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
