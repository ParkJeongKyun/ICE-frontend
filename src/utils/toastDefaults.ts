import { MessageType } from '@/contexts/MessageContext/MessageContext';

export const TOAST_DEFAULTS: Record<
  string,
  { type: MessageType; duration: number }
> = {
  // 워커
  WORKER_CREATION_FAILED: { type: 'error', duration: 10000 },
  WORKER_ERROR: { type: 'error', duration: 10000 },

  // 웹어셈블리
  WASM_LOAD_FAILED: { type: 'error', duration: 10000 },
  WASM_NOT_READY: { type: 'error', duration: 10000 },

  // 파일
  FILE_PROCESSING_FAILED: { type: 'error', duration: 10000 },

  // 분석
  ANALYSIS_ERROR: { type: 'error', duration: 10000 },
  ANALYSIS_TIMEOUT: { type: 'error', duration: 10000 },
  ANALYSIS_SUCCESS: { type: 'success', duration: 4000 },

  // 검색
  SEARCH_TIMEOUT: { type: 'error', duration: 10000 },
  SEARCH_WASM_ERROR: { type: 'error', duration: 10000 },
  SEARCH_NO_RESULTS: { type: 'info', duration: 6000 },
  SEARCH_SUCCESS: { type: 'success', duration: 4000 },
  SEARCH_NO_INPUT: { type: 'warning', duration: 4000 },
  SEARCH_INVALID_HEX: { type: 'warning', duration: 4000 },
  SEARCH_OFFSET_OUT_OF_RANGE: { type: 'warning', duration: 4000 },
  SEARCH_ERROR: { type: 'error', duration: 10000 },
  SEARCH_CANCELLED: { type: 'info', duration: 4000 },

  // 복사
  COPY_SUCCESS: { type: 'info', duration: 3000 },
  COPY_ERROR: { type: 'error', duration: 5000 },

  // 데이터 변환
  CONVERT_ENCODE_FAILED: { type: 'warning', duration: 4000 },
  CONVERT_DECODE_FAILED: { type: 'warning', duration: 4000 },

  // 해시
  NO_FILE_SELECTED: { type: 'warning', duration: 4000 },
  HASH_CALCULATION_SUCCESS: { type: 'success', duration: 4000 },
  HASH_TIMEOUT: { type: 'error', duration: 10000 },
  HASH_ERROR: { type: 'error', duration: 10000 },
  HASH_CANCELLED: { type: 'info', duration: 4000 },

  // 청크
  CHUNK_READ_ERROR: { type: 'error', duration: 10000 },

  // IP
  IP_FETCH_SUCCESS: { type: 'success', duration: 20000 },
  IP_COPIED: { type: 'info', duration: 3000 },
  IP_FETCH_ERROR: { type: 'error', duration: 10000 },

  // 위치 정보
  ADDRESS_FETCH_ERROR: { type: 'error', duration: 10000 },
  LEAFLET_MAP_INVALID_LOCATION: { type: 'warning', duration: 6000 },
  LEAFLET_MAP_LOAD_ERROR: { type: 'error', duration: 10000 },

  // 기타
  USER_CANCELLED: { type: 'info', duration: 4000 },
  UNKNOWN_ERROR: { type: 'error', duration: 10000 },
};

export const getToastDefaults = (code: string) => {
  return (
    TOAST_DEFAULTS[code] || { type: 'info' as MessageType, duration: 6000 }
  );
};
