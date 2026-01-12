/**
 * Nominatim (OpenStreetMap) API를 이용한 역지오코딩
 * - 완전 무료, 전 세계 지원
 * - 초당 1 요청 제한
 * - 전역 좌표 캐싱으로 중복 API 호출 방지
 */

interface NominatimResponse {
  address: {
    country?: string;
    country_code?: string;
    state?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    [key: string]: string | undefined;
  };
  display_name?: string;
}

// 전역 좌표→주소 캐시 (모든 탭에서 공유)
const globalAddressCache = new Map<string, string>();

/**
 * 전역 캐시에서 주소 조회
 */
export const getAddressFromGlobalCache = (lat: string | number, lng: string | number): string | undefined => {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (!isFinite(latNum) || !isFinite(lngNum)) {
    return undefined;
  }

  const cacheKey = `${latNum},${lngNum}`;
  return globalAddressCache.get(cacheKey);
};

/**
 * 전역 캐시에 주소 저장
 */
export const setAddressToGlobalCache = (lat: string | number, lng: string | number, address: string): void => {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (!isFinite(latNum) || !isFinite(lngNum)) {
    return;
  }

  const cacheKey = `${latNum},${lngNum}`;
  globalAddressCache.set(cacheKey, address);
};

/**
 * Nominatim API를 이용한 좌표 → 주소 변환 (역지오코딩)
 * 캐싱은 컴포넌트에서 처리
 * @param lat 위도
 * @param lng 경도
 * @returns 주소 문자열
 */
export const getAddress = async (
  lat: string | number,
  lng: string | number,
  timeout: number = 5000
): Promise<string> => {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (!isFinite(latNum) || !isFinite(lngNum)) {
    throw new Error('Invalid coordinates');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=10&addressdetails=1&accept-language=ko`,
      {
        headers: {
          'User-Agent': 'ICE-Frontend-ExifViewer',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimResponse = await response.json();

    let result = '';
    // display_name이 가장 완전한 주소
    if (data.display_name) {
      result = data.display_name;
    } else if (data.address) {
      // 대체: address 객체에서 조합
      const parts = [
        data.address.country,
        data.address.state,
        data.address.county,
        data.address.city || data.address.town || data.address.village,
      ].filter(Boolean);

      result = parts.length > 0 ? parts.join(', ') : `${latNum}, ${lngNum}`;
    } else {
      // 최후의 수단: 좌표만 반환
      result = `${latNum}, ${lngNum}`;
    }

    return result;
  } catch (error) {
    console.error('[getAddress] Nominatim API 호출 실패:', error);
    throw error;
  }
};

// 위치값 유효성 검사
export function isValidLocation(lat: unknown, lng: unknown) {
  return isValidNumber(lat) && isValidNumber(lng);
}

// 숫자 유효성 검사
export function isValidNumber(value: unknown): boolean {
  if (typeof value === 'number') {
    return isFinite(value);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numberValue = Number(value);
    return !isNaN(numberValue) && isFinite(numberValue);
  }

  return false;
}
