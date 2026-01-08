/* global kakao */
import { useLayoutEffect } from 'react';
import { IceMap, IceMapContainer } from './index.styles';
import { isValidLocation, isWithinKoreaBounds } from '@/utils/getAddress';
import { useMessage } from '@/contexts/MessageContext';

/* Kakao Map */
declare var kakao: any;

interface Props {
  latitude: string;
  longitude: string;
}

const KakaoMap: React.FC<Props> = ({ latitude, longitude }) => {
  const { showMessage } = useMessage();

  useLayoutEffect(() => {
    if (isValidLocation(latitude, longitude)) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // 대한민국 영토 범위 체크
      if (!isWithinKoreaBounds(lat, lng)) {
        console.info(
          `[KakaoMap] 해외 좌표 감지: (${lat}, ${lng}) - 지도 표시 불가`
        );
        showMessage('KAKAO_MAP_OUT_OF_BOUNDS');
        return;
      }
      
      try {
        mapscript(latitude, longitude);
      } catch (error) {
        console.error('[KakaoMap] Map initialization failed:', error);
        showMessage('KAKAO_MAP_LOAD_ERROR');
      }
    } else {
      showMessage('KAKAO_MAP_INVALID_LOCATION');
    }
  }, [latitude, longitude, showMessage]);

  const mapscript = (lat: any, lng: any) => {
    const container = document.getElementById('IceLocaionMap');
    if (!container) {
      throw new Error('Map container not found');
    }

    const options = {
      center: new kakao.maps.LatLng(lat, lng),
      level: 3,
    };

    const map = new kakao.maps.Map(container, options);
    const markerPosition = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    marker.setMap(map);
  };

  return (
    <IceMapContainer>
      <IceMap id="IceLocaionMap" />
    </IceMapContainer>
  );
};

export default KakaoMap;
