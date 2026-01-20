import { useLayoutEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { IceMap, IceMapContainer, AddressInfo, ContentDiv, CellHeaderDiv, CellBodyDiv } from './index.styles';
import { isValidLocation, getAddress } from '@/utils/getAddress';
import { useMessage } from '@/contexts/MessageContext';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useAddressCache } from '@/contexts/TabDataContext';

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
  const { t, i18n } = useTranslation();
  const { showMessage } = useMessage();
  const { updateAddressCache, addressCache } = useAddressCache();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState<string>('');

  useLayoutEffect(() => {
    if (!isValidLocation(latitude, longitude)) {
      return;
    }

    const lang = i18n.language || 'en';
    const latNum = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lngNum = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    const coordKey = `${latNum},${lngNum}`;

    const langCoordState = addressCache?.[lang]?.[coordKey];
    if (langCoordState && langCoordState.address) {
      setAddress(langCoordState.address);
      return;
    }

    (async () => {
      try {
        const resolvedAddress = await getAddress(latitude, longitude, lang);
        updateAddressCache(lang, latitude, longitude, { address: resolvedAddress, latitude, longitude });
        setAddress(resolvedAddress);
      } catch (error) {
        console.error('[LeafletMap] 주소 조회 실패:', error);
        showMessage('ADDRESS_FETCH_ERROR');
      }
    })();
  }, [latitude, longitude, i18n.language]);

  // 지도 초기화 및 렌더링
  useLayoutEffect(() => {
    if (!isValidLocation(latitude, longitude)) {
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

      const marker = L.marker([lat, lng], { icon: DefaultIcon }).addTo(map);
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
      showMessage('LEAFLET_MAP_LOAD_ERROR');
    }
  }, [latitude, longitude, showMessage]);

  return (
    <IceMapContainer>
      <IceMap id="IceLocaionMap" />
      <AddressInfo>
        <ContentDiv>
          <CellHeaderDiv>{t('exifViewer.address')}</CellHeaderDiv>
          <CellBodyDiv>{address || `${latitude}, ${longitude}`}</CellBodyDiv>
        </ContentDiv>
      </AddressInfo>
    </IceMapContainer>
  );
};

export default LeafletMap;
