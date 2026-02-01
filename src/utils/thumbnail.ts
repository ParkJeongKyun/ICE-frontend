/**
 * Next.js SSR 대응 및 포맷 변환 로직 통합본
 */

const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_QUALITY = 0.8;

const isBrowser = typeof window !== 'undefined';

// 1. Hex -> Blob 변환 (Go에서 넘어온 데이터 처리)
export const hexToBlob = (hexStr: string, type = 'image/jpeg'): Blob | null => {
  try {
    const clean = String(hexStr || '').replace(/[^0-9a-fA-F]/g, '');
    if (clean.length < 2 || clean.length % 2 !== 0) return null;
    const pairs = clean.match(/.{1,2}/g) ?? [];
    const bytes = new Uint8Array(pairs.map((p) => parseInt(p, 16)));
    if (!bytes.length) return null;
    return new Blob([bytes], { type });
  } catch (e) {
    return null;
  }
};

// 2. File Slice -> Blob 변환 (Offset/Length 기반)
export const sliceToBlob = (
  file: File,
  offset: number,
  len: number
): Blob | null => {
  try {
    if (
      Number.isNaN(offset) ||
      Number.isNaN(len) ||
      offset < 0 ||
      offset + len > file.size
    )
      return null;
    return file.slice(offset, offset + len);
  } catch (e) {
    return null;
  }
};

/**
 * 3. [에러 해결 포인트] EXIF 태그 데이터로부터 Blob 생성 (정상적으로 export 함)
 */
export const createThumbnailBlobFromTag = (
  tagData: any,
  lenData?: any,
  file?: File
): Blob | null => {
  if (!tagData) return null;

  // 1) Hex 문자열인 경우 처리
  const hexBlob = hexToBlob(String(tagData));
  if (hexBlob) return hexBlob;

  // 2) Offset + Length인 경우 처리
  if (
    file &&
    /^\d+$/.test(String(tagData)) &&
    lenData &&
    /^\d+$/.test(String(lenData))
  ) {
    const off = parseInt(String(tagData), 10);
    const len = parseInt(String(lenData), 10);
    const blob = sliceToBlob(file, off, len);
    if (blob) return blob;
  }

  return null;
};

/**
 * 4. 브라우저 미지원 포맷 변환 (HEIC/TIFF)
 */
export const getRenderableBlob = async (file: File | Blob): Promise<Blob> => {
  if (!isBrowser) return file;

  const type = file.type.toLowerCase();
  const name = (file as File).name?.toLowerCase() || '';

  // HEIC 변환
  if (
    type.includes('heic') ||
    type.includes('heif') ||
    name.endsWith('.heic')
  ) {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      return Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      console.error('HEIC 변환 실패:', e);
    }
  }

  // TIFF 변환
  if (
    type.includes('tiff') ||
    name.endsWith('.tif') ||
    name.endsWith('.tiff')
  ) {
    try {
      const UTIF = (await import('utif')).default;
      const buffer = await file.arrayBuffer();
      const ifds = UTIF.decode(buffer);
      UTIF.decodeImage(buffer, ifds[0]);
      const rgba = UTIF.toRGBA8(ifds[0]);

      const canvas = document.createElement('canvas');
      canvas.width = ifds[0].width;
      canvas.height = ifds[0].height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
      }
    } catch (e) {
      console.error('TIFF 변환 실패:', e);
    }
  }

  return file;
};

/**
 * 5. Canvas 리사이징 썸네일 생성
 */
export const createThumbnailFromImage = async (
  file: File,
  maxWidth: number = THUMBNAIL_MAX_WIDTH,
  quality: number = THUMBNAIL_QUALITY
): Promise<Blob> => {
  if (!isBrowser) throw new Error('Client-side only');

  const renderableFile = await getRenderableBlob(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ratio = img.height / img.width;
          canvas.width = maxWidth;
          canvas.height = maxWidth * ratio;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context error'));

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              blob ? resolve(blob) : reject(new Error('Blob null'));
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(renderableFile);
  });
};
