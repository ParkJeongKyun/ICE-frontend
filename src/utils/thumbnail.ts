/**
 * 썸네일 유틸
 * Go WASM에서 base64 Data URL로 받아서 사용하거나
 * 메인 스레드에서 HEIC/HEIF 처리
 */

import { calculateThumbnailSize, MAX_THUMBNAIL_SIZE } from './thumbnailUtils';

// Go WASM에서 받은 base64 Data URL을 Blob으로 변환
export async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  try {
    if (!dataUrl) return null;
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    console.error('[thumbnail] Data URL to Blob conversion failed:', error);
    return null;
  }
}

/**
 * 메인 스레드에서 썸네일 생성 (HEIC/HEIF 전용)
 * @param file - 원본 이미지 파일
 * @param mimeType - MIME 타입
 * @returns base64 Data URL 또는 null
 */
export async function generateThumbnailInMainThread(
  file: File,
  mimeType: string
): Promise<string | null> {
  // HEIC/HEIF만 메인 스레드에서 처리
  const heicFormats = ['image/heic', 'image/heif'];

  if (!heicFormats.includes(mimeType.toLowerCase())) {
    return null;
  }

  try {
    // 동적 import로 heic2any 로드 (번들 크기 최적화)
    const heic2any = (await import('heic2any')).default;

    // HEIC -> JPEG 변환
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    // 배열인 경우 첫 번째 요소 사용
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // Blob을 이미지로 로드
    const imageUrl = URL.createObjectURL(blob);

    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // 썸네일 크기 계산
      const { width, height } = calculateThumbnailSize(
        img.width,
        img.height,
        MAX_THUMBNAIL_SIZE
      );

      // Canvas로 리사이징
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }

      // 고품질 리사이징
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Data URL로 변환
      return canvas.toDataURL('image/jpeg', 0.85);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error('[thumbnail] HEIC thumbnail generation failed:', error);
    return null;
  }
}
