import { ExifRow } from '@/types';
import { getAddress, isValidLocation } from './getAddress';

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
              [lat, lng] = item.origindata
                .split(',')
                .map((v) => v.trim());

              if (isValidLocation(lat, lng)) {
                address = await getAddress(lat, lng);
                processedData = address;
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
