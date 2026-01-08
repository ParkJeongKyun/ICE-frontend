/* global kakao */
/* Kakao Map */
declare var kakao: any;

/**
 * 대한민국 영토 위경도 범위
 * - 위도(Latitude): 33.0 ~ 38.6 (제주도 포함, 독도 포함)
 * - 경도(Longitude): 124.5 ~ 132.0 (서해 ~ 독도)
 */
const KOREA_BOUNDS = {
  LAT_MIN: 33.0,
  LAT_MAX: 38.6,
  LNG_MIN: 124.5,
  LNG_MAX: 132.0,
} as const;

/**
 * 좌표가 대한민국 영토 범위 내에 있는지 확인
 */
export function isWithinKoreaBounds(lat: number, lng: number): boolean {
  return (
    lat >= KOREA_BOUNDS.LAT_MIN &&
    lat <= KOREA_BOUNDS.LAT_MAX &&
    lng >= KOREA_BOUNDS.LNG_MIN &&
    lng <= KOREA_BOUNDS.LNG_MAX
  );
}

/*** 카카오맵 API 이용 맵 데이터 얻기 */
export const getAddress = (
  lat: string | number,
  lng: string | number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

    // 대한민국 영토 범위 체크 - API 호출 전 필터링
    if (!isWithinKoreaBounds(latNum, lngNum)) {
      reject('OUT_OF_KOREA_BOUNDS');
      return;
    }

    let geocoder = new kakao.maps.services.Geocoder();
    let coord = new kakao.maps.LatLng(lat, lng);
    let callback = function (result: any, status: any) {
      if (status === kakao.maps.services.Status.OK) {
        // 도로명 주소 우선으로 주기, 없으면 구주소
        let road_address = result[0]?.road_address?.address_name;
        let address = result[0]?.address?.address_name;
        resolve(road_address ? road_address : address);
      } else {
        reject(status);
      }
    };
    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  });
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
