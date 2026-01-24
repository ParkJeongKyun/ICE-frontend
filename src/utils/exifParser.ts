import dayjs from 'dayjs';
import { ExifRow, ExifInfo, IfdInfo } from '@/types';
import { parseGPSFromRows } from './gps';
import {
  createThumbnailBlobFromTag,
  createThumbnailFromImage,
} from './thumbnail';

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
 * - GO가 반환한 객체(또는 JSON 문자열)를 입력으로 허용
 * - 태그 배열을 정리하여 `ExifInfo`를 반환
 */
export const parseExifData = async (
  exifData: unknown,
  file?: File,
  mimeType?: string
): Promise<ExifInfo> => {
  let tagInfos: ExifRow[] | null = null;
  let thumbnail = '';
  let lat = 'NaN';
  let lng = 'NaN';
  let baseOffset = 0;
  let byteOrder: string | undefined;
  let firstIfdOffset: number | undefined;
  let ifdInfos: IfdInfo[] | undefined;

  try {
    const parsed: any =
      typeof exifData === 'string' ? JSON.parse(exifData) : (exifData as any);

    if (!parsed || !Array.isArray(parsed.tags)) {
      // 태그 배열이 없어도 이미지면 썸네일 생성
      if (file && mimeType && mimeType.startsWith('image')) {
        try {
          const thumbBlob = await createThumbnailFromImage(file);
          thumbnail = URL.createObjectURL(thumbBlob);
        } catch (err) {
          thumbnail = URL.createObjectURL(file);
        }
      }
      return {
        tagInfos: null,
        thumbnail,
        location: { lat, lng },
        byteOrder,
        firstIfdOffset,
        ifdInfos,
        baseOffset,
      } as ExifInfo;
    }

    const metaRows = parsed.tags as any[];

    // GO에서 제공되는 필드 안정적으로 읽기
    baseOffset = Number(parsed.baseOffset) || 0;
    byteOrder = parsed.byteOrder ? String(parsed.byteOrder) : undefined;
    firstIfdOffset =
      parsed.firstIfdOffset !== undefined && parsed.firstIfdOffset !== null
        ? Number(parsed.firstIfdOffset)
        : undefined;
    ifdInfos = Array.isArray(parsed.ifdInfo)
      ? (parsed.ifdInfo as IfdInfo[])
      : undefined;

    // GPS 파싱
    const parsedGPS = parseGPSFromRows(metaRows);
    lat = parsedGPS.lat;
    lng = parsedGPS.lng;

    // 태그 리스트 정규화
    tagInfos = metaRows.map((item: any) => ({
      tag: String(item.tag ?? ''),
      data: item.data,
      type: item.type,
      offset: Number.isFinite(Number(item.offset))
        ? Number(item.offset)
        : undefined,
      length: Number.isFinite(Number(item.length))
        ? Number(item.length)
        : undefined,
      isFar: Boolean(item.isFar),
    })) as ExifRow[];

    // 썸네일 추출 (우선 EXIF thumb tags, 없으면 image 파일로 폴백)
    const findTag = (names: string[]) =>
      metaRows.find((it: any) => names.includes(it.tag));
    const thumbTag = findTag([
      'JPEGInterchangeFormat',
      'ThumbJPEGInterchangeFormat',
    ]);
    const thumbLenTag = findTag([
      'JPEGInterchangeFormatLength',
      'ThumbJPEGInterchangeFormatLength',
    ]);

    const createFromTagBlob = (tagItem?: any, lenItem?: any): Blob | null => {
      if (!tagItem || !tagItem.data) return null;
      return createThumbnailBlobFromTag(tagItem.data, lenItem?.data, file);
    };

    const topBlob = createFromTagBlob(thumbTag, thumbLenTag);
    if (topBlob) {
      thumbnail = URL.createObjectURL(topBlob);
    } else if (file && mimeType && mimeType.startsWith('image')) {
      // EXIF 썸네일이 없으면 Canvas로 리사이징
      try {
        const thumbBlob = await createThumbnailFromImage(file);
        thumbnail = URL.createObjectURL(thumbBlob);
      } catch (err) {
        thumbnail = URL.createObjectURL(file);
      }
    }
  } catch (err) {
    console.error('parseExifData error:', err);
  }

  return {
    tagInfos,
    thumbnail,
    location: { lat, lng },
    byteOrder,
    firstIfdOffset,
    ifdInfos,
    baseOffset,
  } as ExifInfo;
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
