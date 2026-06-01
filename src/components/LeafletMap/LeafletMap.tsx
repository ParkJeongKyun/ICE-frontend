'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  IceMap,
  IceMapContainer,
  AddressInfo,
  ContentDiv,
  CellHeaderDiv,
  CellBodyDiv,
  DisabledMapPlaceholder,
} from './LeafletMap.styles';
import {
  isValidLocation,
  getAddress,
  isZeroLocation,
} from '@/utils/getAddress';
import eventBus from '@/types/eventBus';
// Ignore missing type declarations for CSS side-effect import
// @ts-ignore
import 'leaflet/dist/leaflet.css';

import { useTranslations, useLocale } from 'next-intl';
import { useAddressCache } from '@/contexts/TabDataContext/TabDataContext';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';

interface Props {
  latitude: string;
  longitude: string;
}

const LeafletMap: React.FC<Props> = ({ latitude, longitude }) => {
  const t = useTranslations();
  const locale = useLocale();
  const { config } = useConfig();
  const { updateAddressCache, addressCache } = useAddressCache();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState<string>('');

  useLayoutEffect(() => {
    if (
      !isValidLocation(latitude, longitude) ||
      !config.analysis.locationTracking ||
      isZeroLocation(latitude, longitude)
    ) {
      return;
    }

    const lang = locale || 'en';
    const latNum =
      typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lngNum =
      typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    const coordKey = `${latNum},${lngNum}`;

    const langCoordState = addressCache?.[lang]?.[coordKey];
    if (langCoordState && langCoordState.address) {
      setAddress(langCoordState.address);
      return;
    }

    (async () => {
      try {
        const resolvedAddress = await getAddress(latitude, longitude, lang);
        updateAddressCache(lang, latitude, longitude, {
          address: resolvedAddress,
          latitude,
          longitude,
        });
        setAddress(resolvedAddress);
      } catch (error) {
        console.error('[LeafletMap] 주소 조회 실패:', error);
        eventBus.emit('toast', { code: 'ADDRESS_FETCH_ERROR' });
      }
    })();
  }, [latitude, longitude, locale]);

  // 지도 초기화 및 렌더링
  useLayoutEffect(() => {
    const markerIcon = '/marker/marker-camera.svg';
    const shadowIcon = '/marker/marker-shadow.svg';

    const MarkerIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: shadowIcon,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = MarkerIcon;
    if (!isValidLocation(latitude, longitude)) {
      eventBus.emit('toast', { code: 'LEAFLET_MAP_INVALID_LOCATION' });
      return;
    }

    if (
      !config.analysis.locationTracking ||
      isZeroLocation(latitude, longitude)
    ) {
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

      const map = L.map('IceLocaionMap').setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { icon: MarkerIcon }).addTo(map);
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
      eventBus.emit('toast', { code: 'LEAFLET_MAP_LOAD_ERROR' });
    }
  }, [latitude, longitude, config.analysis.locationTracking]);

  const isZero = isZeroLocation(latitude, longitude);

  return (
    <IceMapContainer>
      {!config.analysis.locationTracking ? (
        <DisabledMapPlaceholder>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
            <circle cx="12" cy="12" r="2" />
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
            <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
          </svg>
          <span>{t('exifViewer.locationTrackingDisabled')}</span>
        </DisabledMapPlaceholder>
      ) : isZero ? (
        <DisabledMapPlaceholder>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
            {t('exifViewer.zeroLocation')}
          </div>
          <span>{t('exifViewer.zeroLocationMessage')}</span>
        </DisabledMapPlaceholder>
      ) : (
        <IceMap id="IceLocaionMap" />
      )}
      <AddressInfo>
        <ContentDiv>
          <CellHeaderDiv>{t('exifViewer.address')}</CellHeaderDiv>
          <CellBodyDiv>
            {address ? (
              <Tooltip text={`${latitude}, ${longitude}`}>{address}</Tooltip>
            ) : (
              `${latitude}, ${longitude}`
            )}
          </CellBodyDiv>
        </ContentDiv>
      </AddressInfo>
    </IceMapContainer>
  );
};

export default LeafletMap;
