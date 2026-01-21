import dayjs from 'dayjs';
import { ExifRow, ParsedExifResult } from '@/types';
import { parseGPSFromRows } from './gps';
import { createThumbnailBlobFromTag } from './thumbnail';

const HEAD_SIZE = 512 * 1024; // 앞부분 512KB (거대한 MakerNote 대응)
const TAIL_SIZE = 128 * 1024; // 뒷부분 128KB (푸터 분석용)

/**
 * EXIF 데이터 추출을 위한 파일 읽기
 * 파일이 512KB 이하면 전체, 초과하면 앞/뒤 256KB씩 읽어서 병합
 */
export const readFileForExif = async (
  file: File
): Promise<{ buffer: ArrayBuffer; headSize: number; tailSize: number }> => {
  // 1. 파일 전체 크기가 합친 것보다 작으면 그냥 전체 읽기
  if (file.size <= HEAD_SIZE + TAIL_SIZE) {
    const buffer = await file.arrayBuffer();
    return { buffer, headSize: file.size, tailSize: 0 };
  }

  // 2. 앞부분과 뒷부분 조각내서 읽기
  const [headBuffer, tailBuffer] = await Promise.all([
    file.slice(0, HEAD_SIZE).arrayBuffer(),
    file.slice(file.size - TAIL_SIZE).arrayBuffer(),
  ]);

  // 3. 병합 (메모리 효율을 위해 딱 필요한 크기만큼만 할당)
  const combined = new Uint8Array(HEAD_SIZE + TAIL_SIZE);
  combined.set(new Uint8Array(headBuffer), 0);
  combined.set(new Uint8Array(tailBuffer), HEAD_SIZE);

  return {
    buffer: combined.buffer,
    headSize: HEAD_SIZE,
    tailSize: TAIL_SIZE,
  };
};

/**
 * EXIF 데이터 파싱
 * - 주소 변환은 수행하지 않음 (맵 컴포넌트에서 처리)
 * - 좌표만 표시
 */
export const parseExifData = async (
  exifData: string,
  file: File,
  mimeType?: string
): Promise<ParsedExifResult> => {
  let rows: ExifRow[] | null = null;
  let thumbnail = '';
  let lat = 'NaN';
  let lng = 'NaN';

  try {
    const meta: ExifRow[] = JSON.parse(exifData);
    if (meta && Array.isArray(meta)) {
      const parsedGPS = parseGPSFromRows(meta);
      lat = parsedGPS.lat;
      lng = parsedGPS.lng;

      const createFromTagBlob = (tagItem?: ExifRow, lenItem?: ExifRow): Blob | null => {
        if (!tagItem || !tagItem.data) return null;
        return createThumbnailBlobFromTag(tagItem.data, lenItem?.data, file);
      };

      rows = meta.map((item) => {
        const row: any = {
          tag: item.tag,
          data: item.data,
          type: item.type,
          offset: item.offset,
          length: item.length,
          isFar: item.isFar,
        };


        return row as ExifRow;
      });

      // top-level thumbnail extraction (prefer EXIF thumb tags)
      const thumbTag = meta.find(
        (item) => item.tag === 'JPEGInterchangeFormat' || item.tag === 'ThumbJPEGInterchangeFormat'
      );
      const thumbLenTag = meta.find(
        (item) =>
          item.tag === 'JPEGInterchangeFormatLength' || item.tag === 'ThumbJPEGInterchangeFormatLength'
      );

      const topBlob = createFromTagBlob(thumbTag, thumbLenTag);
      if (topBlob) {
        thumbnail = URL.createObjectURL(topBlob);
      } else if (mimeType?.startsWith('image')) {
        // fallback to whole file as thumbnail
        thumbnail = URL.createObjectURL(file);
      }
    }
  } catch (error) {
    console.error('EXIF 파싱 실패:', error);
  }

  return {
    rows,
    thumbnail,
    location: { lat, lng },
  };
};

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
