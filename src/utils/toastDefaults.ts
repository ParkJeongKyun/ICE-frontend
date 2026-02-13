import { MessageType } from '@/contexts/MessageContext/MessageContext';

export const TOAST_DEFAULTS: Record<
  string,
  { type: MessageType; duration: number }
> = {
  // Worker 관련
  WORKER_CREATION_FAILED: { type: 'error', duration: 10000 },
  WORKER_ERROR: { type: 'error', duration: 10000 },

  // WASM 관련
  WASM_LOAD_FAILED: { type: 'error', duration: 10000 },
  WASM_NOT_READY: { type: 'warning', duration: 6000 },
  WASM_LOADED_SUCCESS: { type: 'success', duration: 4000 },

  // 파일 처리 관련
  FILE_PROCESSING_FAILED: { type: 'error', duration: 10000 },
  FILE_READ_ERROR: { type: 'error', duration: 10000 },

  // EXIF 관련
  EXIF_ERROR: { type: 'error', duration: 10000 },
  EXIF_PARSE_ERROR: { type: 'error', duration: 10000 },
  EXIF_TIMEOUT: { type: 'error', duration: 10000 },
  EXIF_SUCCESS: { type: 'success', duration: 4000 },

  // 검색 관련
  SEARCH_TIMEOUT: { type: 'error', duration: 10000 },
  SEARCH_WASM_ERROR: { type: 'error', duration: 10000 },
  SEARCH_NO_RESULTS: { type: 'info', duration: 6000 },
  SEARCH_SUCCESS: { type: 'success', duration: 4000 },
  SEARCH_NO_INPUT: { type: 'warning', duration: 4000 },
  SEARCH_INVALID_HEX: { type: 'warning', duration: 4000 },
  SEARCH_OFFSET_OUT_OF_RANGE: { type: 'warning', duration: 4000 },
  SEARCH_ERROR: { type: 'error', duration: 10000 },

  // 복사 관련
  COPY_SUCCESS: { type: 'success', duration: 3000 },
  COPY_ERROR: { type: 'error', duration: 5000 },

  // Hash 관련
  NO_FILE_SELECTED: { type: 'warning', duration: 4000 },
  HASH_CALCULATION_SUCCESS: { type: 'success', duration: 4000 },
  HASH_TIMEOUT: { type: 'error', duration: 10000 },
  HASH_ERROR: { type: 'error', duration: 10000 },

  // 청크 관련
  CHUNK_READ_ERROR: { type: 'error', duration: 10000 },

  // 기타
  IP_COPIED: { type: 'success', duration: 3000 },
  IP_FETCH_ERROR: { type: 'error', duration: 10000 },
  ADDRESS_FETCH_ERROR: { type: 'error', duration: 10000 },
  LEAFLET_MAP_INVALID_LOCATION: { type: 'warning', duration: 6000 },
  LEAFLET_MAP_LOAD_ERROR: { type: 'error', duration: 10000 },
  UNKNOWN_ERROR: { type: 'error', duration: 10000 },
};

export const getToastDefaults = (code: string) => {
  return (
    TOAST_DEFAULTS[code] || { type: 'info' as MessageType, duration: 6000 }
  );
};
