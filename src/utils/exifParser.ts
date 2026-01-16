import dayjs from 'dayjs';
import { ExifRow, ParsedExifResult } from '@/types';

const HEAD_SIZE = 512 * 1024; // 앞부분 512KB (거대한 MakerNote 대응)
const TAIL_SIZE = 128 * 1024; // 뒷부분 128KB (푸터 분석용)

/**
 * EXIF 데이터 추출을 위한 파일 읽기
 * 파일이 512KB 이하면 전체, 초과하면 앞/뒤 256KB씩 읽어서 병합
 */
export const readFileForExif = async (file: File): Promise<{ buffer: ArrayBuffer; headSize: number; tailSize: number }> => {
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
    tailSize: TAIL_SIZE 
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

  // 분수 문자열([43/1 28/1 ...])을 소수점으로 변환하는 헬퍼 함수
  const parseRationalGPS = (data: string, ref: string): string => {
    try {
      // "[43/1 28/1 2814/100]" -> ["43/1", "28/1", "2814/100"]
      const parts = data.replace(/[\[\]]/g, '').split(/\s+/);
      if (parts.length < 3) return 'NaN';

      const values = parts.map(p => {
        const [num, den] = p.split('/').map(Number);
        return num / den;
      });

      // 도(Degree) + 분(Minute)/60 + 초(Second)/3600
      let decimal = values[0] + values[1] / 60 + values[2] / 3600;

      // S(남위) 또는 W(서경)인 경우 음수로 변환
      if (ref === 'S' || ref === 'W') {
        decimal = decimal * -1;
      }

      return decimal.toFixed(6); // 소수점 6자리까지
    } catch (e) {
      return 'NaN';
    }
  };

  try {
    const meta: ExifRow[] = JSON.parse(exifData);
      console.log(meta)
    if (meta && Array.isArray(meta)) {
      // 1. GPS 관련 값들을 먼저 수집 (Ref 태그가 필요하기 때문)
      const gpsMap: Record<string, string> = {};
      meta.forEach(item => {
        if (item.tag.startsWith('GPS')) {
          gpsMap[item.tag] = item.data;
        }
      });

      // 2. 좌표 계산
      if (gpsMap.GPSLatitude && gpsMap.GPSLatitudeRef) {
        lat = parseRationalGPS(gpsMap.GPSLatitude, gpsMap.GPSLatitudeRef);
      }
      if (gpsMap.GPSLongitude && gpsMap.GPSLongitudeRef) {
        lng = parseRationalGPS(gpsMap.GPSLongitude, gpsMap.GPSLongitudeRef);
      }

      // 3. rows 매핑
      rows = meta.map((item) => ({
        tag: item.tag,
        data: item.data,
        type: item.type,
        offset: item.offset,
        length: item.length,
        isFar: item.isFar,
      }));
    }

    if (mimeType?.startsWith('image')) {
      thumbnail = URL.createObjectURL(file);
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
