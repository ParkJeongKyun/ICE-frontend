// Utilities for creating Blobs from EXIF thumbnail data

const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_QUALITY = 0.8;

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

export const createThumbnailBlobFromTag = (
  tagData: any,
  lenData?: any,
  file?: File
): Blob | null => {
  if (!tagData) return null;

  // 1) try hex bytes
  const hexBlob = hexToBlob(String(tagData));
  if (hexBlob) return hexBlob;

  // 2) try offset + length
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
 * Canvas를 사용해 이미지 파일을 리사이징하여 썸네일 생성
 * @param file 이미지 파일
 * @param maxWidth 최대 너비 (기본값: 200px)
 * @param quality 이미지 품질 (기본값: 0.8, 0~1)
 * @returns Promise<Blob>
 */
export const createThumbnailFromImage = (
  file: File,
  maxWidth: number = THUMBNAIL_MAX_WIDTH,
  quality: number = THUMBNAIL_QUALITY
): Promise<Blob> => {
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
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            },
            file.type || 'image/jpeg',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};
