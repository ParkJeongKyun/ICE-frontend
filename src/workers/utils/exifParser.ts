import { ExifInfo, ExifRow, IfdInfo } from '@/types';

// EXIF 데이터를 파싱하여 ExifInfo 객체 생성
export async function parseExifDataInWorker(
  exifData: unknown,
  file: File,
  mimeType: string,
  syncReader: FileReaderSync
): Promise<ExifInfo> {
  const parsed: any =
    typeof exifData === 'string' ? JSON.parse(exifData) : exifData;

  const tagInfos: ExifRow[] = (parsed.tags || []).map((item: any) => ({
    tag: item.tag || '',
    ifd: item.ifd || '',
    data: item.data || '',
    type: item.type || '',
    offset: Number(item.offset) || 0,
    length: Number(item.length) || 0,
    isFar: Boolean(item.isFar),
  }));

  const ifdInfos: IfdInfo[] = (parsed.ifdInfo || []).map((item: any) => ({
    ifdName: item.ifdName || '',
    offset: Number(item.offset) || 0,
    tagCount: Number(item.tagCount) || 0,
    nextIfdOffset: Number(item.nextIfdOffset) || 0,
  }));

  return {
    thumbnail: parsed.thumbnail || '',
    baseOffset: Number(parsed.baseOffset) || 0,
    dataSize: Number(parsed.dataSize) || 0,
    endOffset: Number(parsed.endOffset) || 0,
    byteOrder: parsed.byteOrder || '',
    firstIfdOffset: Number(parsed.firstIfdOffset) || 0,
    location: {
      lat: String(parsed.location?.lat || 'NaN'),
      lng: String(parsed.location?.lng || 'NaN'),
    },
    ifdInfos,
    tagInfos,
  };
}
