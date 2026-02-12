import { ExifInfo, ExifRow, IfdInfo } from '@/types';
import dayjs from 'dayjs';

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
// Byte 포매터
export const getBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${formattedSize} ${sizes[i]} (${bytes.toLocaleString()} Byte)`;
};

// 날짜 포맷 지정
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 날짜 포매터
export const getDate = (dateStr: string | number | Date): string => {
  const formattedDate = dayjs(dateStr);
  if (formattedDate.isValid()) {
    return formattedDate.format(DATE_FORMAT);
  } else {
    return '';
  }
};

export const calculateExperience = (startDate: Date, endDate: Date): string => {
  const diffYear = endDate.getFullYear() - startDate.getFullYear();
  const diffMonth = endDate.getMonth() - startDate.getMonth();
  const diffDay = endDate.getDate() - startDate.getDate();

  let years = diffYear;
  let months = diffMonth;

  if (diffDay < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years ? years + '년 ' : ''}${months}개월`;
};
