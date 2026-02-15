/**
 * 썸네일 유틸
 * 메인 스레드에서 모든 포맷의 썸네일 생성
 */

// ============================================================================
// 상수 및 유틸 함수
// ============================================================================

const MAX_THUMBNAIL_SIZE = 512;

/**
 * 이미지 MIME 타입인지 확인
 */
export function isImageMimeType(mimeType: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
}

/**
 * Uint32 배열을 Uint8ClampedArray로 변환
 * TIFF 디코더 결과를 Canvas ImageData로 사용하기 위함
 */
function assign32(
  target: Uint8ClampedArray,
  source: Uint32Array | Uint8Array
): void {
  if (source instanceof Uint32Array) {
    // RGBA 패킹된 32-bit 값 → RGBA 8-bit 4개 값
    for (let i = 0; i < source.length; i++) {
      const val = source[i];
      target[i * 4 + 0] = (val >> 0) & 0xff; // R
      target[i * 4 + 1] = (val >> 8) & 0xff; // G
      target[i * 4 + 2] = (val >> 16) & 0xff; // B
      target[i * 4 + 3] = (val >> 24) & 0xff; // A
    }
  } else {
    // 이미 8-bit 배열인 경우 그대로 복사
    target.set(source);
  }
}

/**
 * 썸네일 크기 계산 (비율 유지)
 */
function calculateThumbnailSize(
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

// ============================================================================
// 썸네일 생성 함수
// ============================================================================

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
 * 메인 스레드에서 썸네일 생성 (모든 포맷)
 * Worker에서는 메모리 제약이 있어 큰 파일 처리 불가
 * @param file - 원본 이미지 파일
 * @param mimeType - MIME 타입
 * @returns base64 Data URL 또는 null
 */
export async function generateThumbnailInMainThread(
  file: File,
  mimeType: string
): Promise<string | null> {
  const mime = mimeType.toLowerCase();
  try {
    // HEIC/HEIF 처리
    if (mime === 'image/heic' || mime === 'image/heif') {
      return await generateHeicThumbnail(file);
    }

    // TIFF 처리
    if (mime === 'image/tiff' || mime === 'image/tif') {
      return await generateTiffThumbnail(file);
    }

    // 표준 포맷 (JPEG, PNG, WEBP, SVG 등)
    return await generateStandardThumbnail(file);
  } catch (error) {
    console.error('[thumbnail] Thumbnail generation failed:', error);
    return null;
  }
}

/**
 * HEIC/HEIF 썸네일 생성
 */
async function generateHeicThumbnail(file: File): Promise<string | null> {
  try {
    // 동적 import로 heic2any 로드 (번들 크기 최적화)
    const heic2any = (await import('heic2any')).default;

    // HEIC -> JPEG 변환
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8, // 일관된 품질 설정
    });

    // 배열인 경우 첫 번째 요소 사용
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    return await generateThumbnailFromBlob(blob);
  } catch (error) {
    console.error('[thumbnail] HEIC thumbnail generation failed:', error);
  }
  return null;
}

/**
 * TIFF 썸네일 생성
 */
async function generateTiffThumbnail(file: File): Promise<string | null> {
  try {
    const utifModule = await import('utif');
    const utif = utifModule.default || utifModule;
    const arrayBuffer = await file.arrayBuffer();
    const images = utif.decode(arrayBuffer);

    if (images && images.length > 0) {
      const firstImage = images[0];
      utif.decodeImage(arrayBuffer, firstImage);

      const canvas = document.createElement('canvas');
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const imageData = ctx.createImageData(
          firstImage.width,
          firstImage.height
        );
        assign32(imageData.data, firstImage.data);
        ctx.putImageData(imageData, 0, 0);

        const { width, height } = calculateThumbnailSize(
          firstImage.width,
          firstImage.height
        );

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = width;
        thumbCanvas.height = height;
        const thumbCtx = thumbCanvas.getContext('2d');

        if (thumbCtx) {
          thumbCtx.imageSmoothingEnabled = true;
          thumbCtx.imageSmoothingQuality = 'high';
          thumbCtx.drawImage(canvas, 0, 0, width, height);

          const mimeType = supportsWebP() ? 'image/webp' : 'image/jpeg';
          const thumbBlob = await canvasToBlob(thumbCanvas, mimeType, 0.8);
          return await blobToDataUrl(thumbBlob);
        }
      }
    }
  } catch (error) {
    console.error('[thumbnail] TIFF thumbnail generation failed:', error);
  }
  return null;
}

/**
 * 표준 이미지 포맷 썸네일 생성 (JPEG, PNG, WEBP, TIFF 등)
 */
async function generateStandardThumbnail(file: File): Promise<string | null> {
  try {
    return await generateThumbnailFromBlob(file);
  } catch (error) {
    console.error('[thumbnail] Standard thumbnail generation failed:', error);
    return null;
  }
}

/**
 * Blob으로부터 썸네일 생성 (공통 로직)
 * 업계 표준: EXIF → Canvas 폴백, 큰 이미지는 다운샘플링
 */
async function generateThumbnailFromBlob(blob: Blob): Promise<string | null> {
  const imageUrl = URL.createObjectURL(blob);

  try {
    // 1️⃣ 이미지 로드 (타임아웃 3초)
    const img = await loadImageWithTimeout(imageUrl, 3000);

    // 2️⃣ 큰 이미지 메모리 최적화
    // 4096x4096 이상이면 다운샘플링 팩터 계산
    const maxDimension = 4096;
    const scaleFactor = Math.max(
      img.width / maxDimension,
      img.height / maxDimension,
      1
    );
    const scaledWidth = Math.ceil(img.width / scaleFactor);
    const scaledHeight = Math.ceil(img.height / scaleFactor);

    // 3️⃣ 썸네일 크기 계산
    const { width, height } = calculateThumbnailSize(
      scaledWidth,
      scaledHeight,
      MAX_THUMBNAIL_SIZE
    );

    // 4️⃣ 원본이 이미 충분히 작으면 압축 생략
    if (scaledWidth <= width && scaledHeight <= height) {
      return await blobToDataUrl(blob);
    }

    // 5️⃣ Canvas 리사이징 (메모리 효율적)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // 6️⃣ WebP 지원 (메모리 50% 감소) + JPEG 폴백
    const mimeType = supportsWebP() ? 'image/webp' : 'image/jpeg';
    const thumbBlob = await canvasToBlob(canvas, mimeType, 0.8);

    return await blobToDataUrl(thumbBlob);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * 타임아웃이 있는 이미지 로드
 */
function loadImageWithTimeout(
  imageUrl: string,
  timeout: number = 3000
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = setTimeout(
      () => reject(new Error('Image load timeout')),
      timeout
    );

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Image load failed'));
    };

    img.src = imageUrl;
  });
}

/**
 * WebP 지원 여부 확인
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('webp') === 5;
}

/**
 * Blob을 Data URL로 변환
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Canvas를 Blob으로 변환 (메인 스레드용)
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      },
      type,
      quality
    );
  });
}
