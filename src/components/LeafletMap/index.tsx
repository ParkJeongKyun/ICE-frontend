import { useLayoutEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { IceMap, IceMapContainer, AddressInfo, ContentDiv, CellHeaderDiv, CellBodyDiv } from './index.styles';
import { isValidLocation, getAddress, getAddressFromGlobalCache, setAddressToGlobalCache } from '@/utils/getAddress';
import { useMessage } from '@/contexts/MessageContext';
import { useTabData } from '@/contexts/TabDataContext';
import 'leaflet/dist/leaflet.css';

// Leaflet 마커 아이콘 설정 (기본 아이콘 사용)
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  latitude: string;
  longitude: string;
}

const LeafletMap: React.FC<Props> = ({ latitude, longitude }) => {
  const { showMessage } = useMessage();
  const { activeKey, updateTabDisplayState } = useTabData();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState<string>('');

  // 주소 조회: 전역 좌표 캐시 → API → 탭 상태 저장
  useLayoutEffect(() => {
    if (!isValidLocation(latitude, longitude)) {
      return;
    }

    // 1. 전역 좌표 캐시 확인
    const cachedAddress = getAddressFromGlobalCache(latitude, longitude);
    if (cachedAddress) {
      console.log('[LeafletMap] 전역 캐시에서 주소 조회:', `${latitude},${longitude}`);
      setAddress(cachedAddress);
      updateTabDisplayState(activeKey, { address: cachedAddress, latitude, longitude });
      return;
    }

    // 2. API 호출
    (async () => {
      try {
        const resolvedAddress = await getAddress(latitude, longitude);
        console.log('[LeafletMap] 주소 조회 완료:', resolvedAddress);
        
        // 3. 전역 캐시에 저장
        setAddressToGlobalCache(latitude, longitude, resolvedAddress);
        
        // 4. 탭 상태에 저장
        updateTabDisplayState(activeKey, { address: resolvedAddress, latitude, longitude });
        
        setAddress(resolvedAddress);
      } catch (error) {
        console.warn('[LeafletMap] 주소 조회 실패:', error);
        // 주소 조회 실패해도 지도는 표시됨
      }
    })();
  }, [latitude, longitude, activeKey, updateTabDisplayState]);

  // 지도 초기화 및 렌더링
  useLayoutEffect(() => {
    if (!isValidLocation(latitude, longitude)) {
      console.warn('[LeafletMap] 유효하지 않은 좌표:', { latitude, longitude });
      showMessage('LEAFLET_MAP_INVALID_LOCATION');
      return;
    }

    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const container = document.getElementById('IceLocaionMap');
      if (!container) {
        throw new Error('Map container not found');
      }

      // 기존 맵이 있으면 제거
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // 새 맵 생성
      const map = L.map('IceLocaionMap').setView([lat, lng], 13);

      // OpenStreetMap 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // 마커 추가 - 주소가 있으면 표시, 없으면 좌표만 표시
      const popupText = address
        ? `<b>${address}</b><br>${latitude}, ${longitude}`
        : `<b>위치</b><br>${latitude}, ${longitude}`;

      const marker = L.marker([lat, lng], { icon: DefaultIcon }).addTo(map);
      marker.bindPopup(popupText);

      markerRef.current = marker;
      mapRef.current = map;

      // 컴포넌트 언마운트 시 맵 정리
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (error) {
      console.error('[LeafletMap] 지도 초기화 실패:', error);
      showMessage('LEAFLET_MAP_LOAD_ERROR');
    }
  }, [latitude, longitude, showMessage]);

  // 주소가 업데이트되면 마커 팝업 업데이트
  useLayoutEffect(() => {
    if (markerRef.current && address) {
      const popupText = `<b>${address}</b><br>${latitude}, ${longitude}`;
      markerRef.current.setPopupContent(popupText);
      console.log('[LeafletMap] 마커 팝업 업데이트:', address);
    }
  }, [address, latitude, longitude]);

  return (
    <IceMapContainer>
      <IceMap id="IceLocaionMap" />
      <AddressInfo>
        <ContentDiv>
          <CellHeaderDiv>주소</CellHeaderDiv>
          <CellBodyDiv>{address || `${latitude}, ${longitude}`}</CellBodyDiv>
        </ContentDiv>
      </AddressInfo>
    </IceMapContainer>
  );
};

export default LeafletMap;
