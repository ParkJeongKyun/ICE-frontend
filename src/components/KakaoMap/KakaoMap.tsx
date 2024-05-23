/* global kakao */
import { useLayoutEffect } from 'react';
import { IceMap, IceMapContainer } from './styles';
import { isValidLocation } from 'utils/getAddress';

/* Kakao Map */
declare var kakao: any;

interface Props {
  latitude: string;
  longitude: string;
}

// 카카오맵
const KakaoMap: React.FC<Props> = ({ latitude, longitude }) => {
  useLayoutEffect(() => {
    if (isValidLocation(latitude, longitude)) {
      // GPS 정보가 정상인 경우
      try {
        // 맵 생성
        mapscript(latitude, longitude);
      } catch (e) {
        console.log(e);
      }
    }
  }, [latitude, longitude]);

  // 맵 생성 스크립트
  const mapscript = (lat: any, lng: any) => {
    let container = document.getElementById('IceLocaionMap');
    let options = {
      center: new kakao.maps.LatLng(lat, lng),
      level: 3,
    };
    //지도
    const map = new kakao.maps.Map(container, options);

    //마커가 표시 될 위치
    let markerPosition = new kakao.maps.LatLng(lat, lng);

    // 마커를 생성
    let marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    // 마커를 지도 위에 표시
    marker.setMap(map);
  };

  return (
    <>
      <IceMapContainer>
        <IceMap id="IceLocaionMap" />
      </IceMapContainer>
    </>
  );
};

export default KakaoMap;
