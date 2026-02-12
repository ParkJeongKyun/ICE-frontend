/**
 * 썸네일 유틸
 * 메인 스레드에서 모든 포맷의 썸네일 생성
 */

// ============================================================================
// 상수 및 유틸 함수
// ============================================================================

const MAX_THUMBNAIL_SIZE = 300;

/**
 * 이미지 MIME 타입인지 확인
 */
export function isImageMimeType(mimeType: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
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
  const heicFormats = ['image/heic', 'image/heif'];

  try {
    // HEIC/HEIF 처리
    if (heicFormats.includes(mime)) {
      return await generateHeicThumbnail(file);
    }

    // 그 외 모든 이미지 포맷 (JPEG, PNG, TIFF, WEBP, SVG 등)
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
    return null;
  }
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
