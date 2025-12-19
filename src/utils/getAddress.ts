/* global kakao */
/* Kakao Map */
declare var kakao: any;

/*** 카카오맵 API 이용 맵 데이터 얻기 */
export const getAddress = (
  lat: string | number,
  lng: string | number
): Promise<string> => {
  return new Promise((resolve, reject) => {
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
