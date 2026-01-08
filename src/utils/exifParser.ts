import dayjs from 'dayjs';
import { ExifRow } from '@/types';
import { getAddress, isValidLocation, isWithinKoreaBounds } from './getAddress';

/**
 * EXIF 데이터 추출을 위한 파일 읽기
 * 파일이 512KB 이하면 전체, 초과하면 앞/뒤 256KB씩 읽어서 병합
 */
export const readFileForExif = async (file: File): Promise<ArrayBuffer> => {
  const EXIF_READ_SIZE = 256 * 1024; // 256KB

  if (file.size <= EXIF_READ_SIZE * 2) {
    // 파일이 512KB 이하: 전체 읽기
    return file.arrayBuffer();
  }

  // 파일이 512KB 초과: 앞 256KB + 뒤 256KB
  const [headBuffer, tailBuffer] = await Promise.all([
    file.slice(0, EXIF_READ_SIZE).arrayBuffer(),
    file.slice(file.size - EXIF_READ_SIZE).arrayBuffer(),
  ]);

  // 병합
  const total = new Uint8Array(EXIF_READ_SIZE * 2);
  total.set(new Uint8Array(headBuffer), 0);
  total.set(new Uint8Array(tailBuffer), EXIF_READ_SIZE);

  return total.buffer;
};

interface ExifMeta {
  tag: string;
  comment: string;
  data: string;
  origindata: string;
  type: string;
  name: string;
  unit: string;
  example: any;
}

export interface ParsedExifResult {
  rows: ExifRow[] | null;
  thumbnail: string;
  location: {
    lat: string;
    lng: string;
    address: string;
  };
}

/**
 * EXIF 데이터 파싱
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
  let address = '';

  try {
    const meta: ExifMeta[] = JSON.parse(exifData);

    if (meta && Array.isArray(meta)) {
      rows = await Promise.all(
        meta.map(async (item, index) => {
          let processedData = item.data;

          // Location 태그 처리
          if (item.tag === 'Location') {
            try {
              [lat, lng] = item.origindata.split(',').map((v) => v.trim());

              if (isValidLocation(lat, lng)) {
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lng);
                
                // 대한민국 영토 범위 내에 있을 때만 API 호출
                if (isWithinKoreaBounds(latNum, lngNum)) {
                  try {
                    address = await getAddress(lat, lng);
                    processedData = address;
                  } catch (error) {
                    console.warn('[ExifParser] Kakao API 호출 실패:', error);
                    // API 호출 실패 시 좌표만 표시
                    processedData = `${lat}, ${lng}`;
                  }
                } else {
                  // 해외 좌표는 좌표만 표시 (주소 변환 시도 X)
                  console.info(
                    `[ExifParser] 해외 좌표 감지: (${lat}, ${lng}) - API 호출 생략`
                  );
                  processedData = `${lat}, ${lng} (해외)`;
                }
              }
            } catch (error) {
              console.error('Location 파싱 실패:', error);
            }
          }

          return {
            id: index + 1,
            meta: item.tag,
            comment: item.comment,
            data: processedData,
            origindata: item.origindata,
            name: item.name,
            type: item.type,
            unit: item.unit,
            example: item.example,
          };
        })
      );
    }

    // 썸네일 생성
    if (mimeType?.startsWith('image')) {
      thumbnail = URL.createObjectURL(file);
    }
  } catch (error) {
    console.error('EXIF 파싱 실패:', error);
  }

  return {
    rows,
    thumbnail,
    location: { lat, lng, address },
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
