// Utilities for creating Blobs from EXIF thumbnail data

export const hexToBlob = (hexStr: string, type = 'image/jpeg'): Blob | null => {
  try {
    const clean = String(hexStr || '').replace(/[^0-9a-fA-F]/g, '');
    if (clean.length < 2 || clean.length % 2 !== 0) return null;
    const pairs = clean.match(/.{1,2}/g) ?? [];
    const bytes = new Uint8Array(pairs.map(p => parseInt(p, 16)));
    if (!bytes.length) return null;
    return new Blob([bytes], { type });
  } catch (e) {
    return null;
  }
};

export const sliceToBlob = (file: File, offset: number, len: number): Blob | null => {
  try {
    if (Number.isNaN(offset) || Number.isNaN(len) || offset < 0 || offset + len > file.size) return null;
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
  if (file && /^\d+$/.test(String(tagData)) && lenData && /^\d+$/.test(String(lenData))) {
    const off = parseInt(String(tagData), 10);
    const len = parseInt(String(lenData), 10);
    const blob = sliceToBlob(file, off, len);
    if (blob) return blob;
  }

  return null;
};
