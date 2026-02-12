import { ExifInfo, ExifRow, IfdInfo } from '@/types';

// EXIF 데이터를 파싱하여 ExifInfo 객체 생성
export async function parseExifDataInWorker(
  exifData: unknown,
  file: File,
  mimeType: string,
  syncReader: FileReaderSync
): Promise<ExifInfo> {
  let thumbnail = '';
  let baseOffset = 0;
  let dataSize = 0;
  let endOffset = 0;
  let byteOrder: string | undefined;
  let firstIfdOffset: number | undefined;
  let ifdInfos: IfdInfo[] | undefined;
  let tagInfos: ExifRow[] | null = null;
  let location = { lat: 'NaN', lng: 'NaN' };

  try {
    const parsed: any =
      typeof exifData === 'string' ? JSON.parse(exifData) : exifData;

    if (parsed && Array.isArray(parsed.tags)) {
      const metaRows = parsed.tags;

      // 메타데이터 추출
      baseOffset = Number(parsed.baseOffset) || 0;
      dataSize = Number(parsed.dataSize) || 0;
      endOffset = Number(parsed.endOffset) || 0;
      byteOrder = parsed.byteOrder ? String(parsed.byteOrder) : undefined;
      firstIfdOffset =
        parsed.firstIfdOffset !== undefined && parsed.firstIfdOffset !== null
          ? Number(parsed.firstIfdOffset)
          : undefined;
      ifdInfos = Array.isArray(parsed.ifdInfo) ? parsed.ifdInfo : undefined;

      // 태그 정규화
      tagInfos = metaRows.map((item: any) => ({
        tag: item.tag,
        ifd: item.ifd,
        data: item.data,
        type: item.type,
        offset: Number.isFinite(Number(item.offset))
          ? Number(item.offset)
          : undefined,
        length: Number.isFinite(Number(item.length))
          ? Number(item.length)
          : undefined,
        isFar: Boolean(item.isFar),
      }));

      // Go WASM에서 생성한 썸네일 및 GPS 좌표 사용
      if (parsed.thumbnail) {
        thumbnail = parsed.thumbnail; // base64 Data URL
      }

      if (parsed.location) {
        location = {
          lat: String(parsed.location.lat || 'NaN'),
          lng: String(parsed.location.lng || 'NaN'),
        };
      }
    }
  } catch (err) {
    console.error('[exifParser] Parse error:', err);
  }

  return {
    thumbnail,
    baseOffset,
    dataSize,
    endOffset,
    byteOrder,
    firstIfdOffset,
    location,
    ifdInfos,
    tagInfos,
  } as ExifInfo;
}
