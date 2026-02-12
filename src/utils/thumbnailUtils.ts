/**
 * 썸네일 생성 공통 유틸리티
 */

export const MAX_THUMBNAIL_SIZE = 300;

/**
 * 썸네일 크기 계산 (비율 유지)
 */
export function calculateThumbnailSize(
  originalWidth: number,
  originalHeight: number,
  maxSize: number = MAX_THUMBNAIL_SIZE
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > height) {
    if (width > maxSize) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    }
  } else {
    if (height > maxSize) {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  return { width, height };
}

/**
 * Uint8Array를 Base64 Data URL로 변환
 */
export function uint8ArrayToDataUrl(
  uint8Array: Uint8Array,
  mimeType: string = 'image/jpeg'
): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return `data:${mimeType};base64,${base64}`;
}

/**
 * ArrayBuffer를 Base64 Data URL로 변환
 */
export async function arrayBufferToDataUrl(
  arrayBuffer: ArrayBuffer,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8ArrayToDataUrl(uint8Array, mimeType);
}
