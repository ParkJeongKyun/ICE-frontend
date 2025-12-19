/**
 * Device Pixel Ratio 가져오기
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * 스크롤바 위치를 계산합니다.
 */
export const calculateScrollbarTop = (
  currentRow: number,
  maxFirstRow: number,
  canvasHeight: number,
  scrollbarHeight: number
): number => {
  if (maxFirstRow <= 0) return 0;

  const ratio = currentRow / maxFirstRow;
  const scrollbarTop = ratio * (canvasHeight - scrollbarHeight);

  return Math.min(canvasHeight - scrollbarHeight, Math.max(0, scrollbarTop));
};

/**
 * 
 * ASCII 문자열을 바이트 배열로 변환하는 함수 (for문으로 최적화)
 */
export const asciiToBytes = (text: string): Uint8Array => {
  const arr = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    arr[i] = text.charCodeAt(i);
  }
  return arr;
};