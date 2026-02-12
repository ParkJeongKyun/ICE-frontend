/**
 * Worker 컨텍스트에서 썸네일 생성
 * OffscreenCanvas를 사용하여 원본 이미지를 리사이징합니다.
 */

import {
  calculateThumbnailSize,
  uint8ArrayToDataUrl,
  MAX_THUMBNAIL_SIZE,
} from '@/utils/thumbnailUtils';

/**
 * File 객체로부터 썸네일 생성
 * @param file - 원본 이미지 파일
 * @param mimeType - MIME 타입
 * @returns base64 Data URL 또는 null
 */
export async function generateThumbnailFromFile(
  file: File,
  mimeType: string
): Promise<string | null> {
  const mime = mimeType.toLowerCase();

  // HEIC/HEIF만 메인 스레드에서 처리 (heic2any가 DOM API 필요)
  const mainThreadFormats = ['image/heic', 'image/heif'];
  if (mainThreadFormats.includes(mime)) {
    return null; // WorkerManager에서 메인 스레드로 처리
  }

  // RAW 포맷은 현재 미지원
  const unsupportedFormats = [
    'image/x-canon-cr2',
    'image/x-canon-crw',
    'image/x-nikon-nef',
    'image/x-sony-arw',
  ];
  if (unsupportedFormats.includes(mime)) {
    return null;
  }

  // TIFF 처리
  if (mime === 'image/tiff' || mime === 'image/tif') {
    return generateTiffThumbnail(file);
  }

  try {
    // 1. File을 Blob URL로 변환
    const imageUrl = URL.createObjectURL(file);

    try {
      // 2. 이미지 로드 (Worker에서는 Image 대신 createImageBitmap 사용)
      const imageBitmap = await createImageBitmap(file);

      // 3. 썸네일 크기 계산 (비율 유지)
      const { width, height } = calculateThumbnailSize(
        imageBitmap.width,
        imageBitmap.height,
        MAX_THUMBNAIL_SIZE
      );

      // 4. OffscreenCanvas로 리사이징
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }

      // 고품질 리사이징 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 이미지 그리기
      ctx.drawImage(imageBitmap, 0, 0, width, height);

      // 5. Blob으로 변환
      const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.85,
      });

      // 6. Base64 Data URL로 변환
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const dataUrl = uint8ArrayToDataUrl(uint8Array, 'image/jpeg');

      // 리소스 정리
      imageBitmap.close();

      return dataUrl;
    } finally {
      // Blob URL 해제
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error('[thumbnailGenerator] Failed to generate thumbnail:', error);
    return null;
  }
}

/**
 * TIFF 이미지 썸네일 생성
 */
async function generateTiffThumbnail(file: File): Promise<string | null> {
  try {
    // 동적 import로 UTIF 라이브러리 로드
    const UTIF = await import('utif');

    // File을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer();

    // TIFF 디코딩
    const ifds = UTIF.decode(arrayBuffer);
    if (!ifds || ifds.length === 0) {
      throw new Error('No images found in TIFF');
    }

    // 첫 번째 이미지 사용
    const firstImage = ifds[0];
    UTIF.decodeImage(arrayBuffer, firstImage);

    const rgba = UTIF.toRGBA8(firstImage);
    const { width, height } = firstImage;

    // ImageData 생성
    const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);

    // 썸네일 크기 계산
    const thumbSize = calculateThumbnailSize(width, height, MAX_THUMBNAIL_SIZE);

    // OffscreenCanvas로 리사이징
    const canvas = new OffscreenCanvas(thumbSize.width, thumbSize.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    // 임시 캔버스에 원본 이미지 그리기
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Failed to get temp 2D context');
    }
    tempCtx.putImageData(imageData, 0, 0);

    // 고품질 리사이징
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, thumbSize.width, thumbSize.height);

    // Blob으로 변환
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.85,
    });

    // Base64 Data URL로 변환
    const arrayBuf = await blob.arrayBuffer();
    return uint8ArrayToDataUrl(new Uint8Array(arrayBuf), 'image/jpeg');
  } catch (error) {
    console.error('[thumbnailGenerator] TIFF processing failed:', error);
    return null;
  }
}
