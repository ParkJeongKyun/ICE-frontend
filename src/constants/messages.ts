import { MessageType } from '@/contexts/MessageContext/MessageContext';
import { useTranslations } from 'next-intl';

export interface MessageTemplate {
  type: MessageType;
  title: string;
  message: string;
  duration: number;
}

export const MESSAGES = {
  // Worker 관련
  WORKER_NOT_INITIALIZED: {
    type: 'error' as MessageType,
    title: 'messages.WORKER_NOT_INITIALIZED.title',
    message: 'messages.WORKER_NOT_INITIALIZED.message',
    duration: 10000,
  },
  WORKER_CREATION_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.WORKER_CREATION_FAILED.title',
    message: 'messages.WORKER_CREATION_FAILED.message',
    duration: 10000,
  },
  WORKER_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.WORKER_ERROR.title',
    message: 'messages.WORKER_ERROR.message',
    duration: 10000,
  },
  WORKER_INIT_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.WORKER_INIT_FAILED.title',
    message: 'messages.WORKER_INIT_FAILED.message',
    duration: 10000,
  },

  // WASM 관련
  WASM_LOADING: {
    type: 'warning' as MessageType,
    title: 'messages.WASM_LOADING.title',
    message: 'messages.WASM_LOADING.message',
    duration: 6000,
  },
  WASM_LOAD_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.WASM_LOAD_FAILED.title',
    message: 'messages.WASM_LOAD_FAILED.message',
    duration: 10000,
  },
  WASM_NOT_READY: {
    type: 'warning' as MessageType,
    title: 'messages.WASM_NOT_READY.title',
    message: 'messages.WASM_NOT_READY.message',
    duration: 6000,
  },
  WASM_LOADED_SUCCESS: {
    type: 'success' as MessageType,
    title: 'messages.WASM_LOADED_SUCCESS.title',
    message: 'messages.WASM_LOADED_SUCCESS.message',
    duration: 4000,
  },

  // 파일 처리 관련
  FILE_PROCESSING_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.FILE_PROCESSING_FAILED.title',
    message: 'messages.FILE_PROCESSING_FAILED.message',
    duration: 10000,
  },
  FILE_READ_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.FILE_READ_ERROR.title',
    message: 'messages.FILE_READ_ERROR.message',
    duration: 10000,
  },
  FILE_READ_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.FILE_READ_FAILED.title',
    message: 'messages.FILE_READ_FAILED.message',
    duration: 5000,
  },
  FILE_TOO_LARGE: {
    type: 'warning' as MessageType,
    title: 'messages.FILE_TOO_LARGE.title',
    message: 'messages.FILE_TOO_LARGE.message',
    duration: 4000,
  },

  // EXIF 관련
  EXIF_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.EXIF_ERROR.title',
    message: 'messages.EXIF_ERROR.message',
    duration: 10000,
  },
  EXIF_PARSE_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.EXIF_PARSE_ERROR.title',
    message: 'messages.EXIF_PARSE_ERROR.message',
    duration: 10000,
  },
  EXIF_PROCESSING_TIMEOUT: {
    type: 'error' as MessageType,
    title: 'messages.EXIF_PROCESSING_TIMEOUT.title',
    message: 'messages.EXIF_PROCESSING_TIMEOUT.message',
    duration: 10000,
  },

  // 검색 관련
  SEARCH_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.SEARCH_FAILED.title',
    message: 'messages.SEARCH_FAILED.message',
    duration: 10000,
  },
  SEARCH_TIMEOUT: {
    type: 'error' as MessageType,
    title: 'messages.SEARCH_TIMEOUT.title',
    message: 'messages.SEARCH_TIMEOUT.message',
    duration: 10000,
  },
  SEARCH_WASM_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.SEARCH_WASM_ERROR.title',
    message: 'messages.SEARCH_WASM_ERROR.message',
    duration: 10000,
  },
  SEARCH_NO_RESULTS: {
    type: 'info' as MessageType,
    title: 'messages.SEARCH_NO_RESULTS.title',
    message: 'messages.SEARCH_NO_RESULTS.message',
    duration: 6000,
  },
  SEARCH_SUCCESS: {
    type: 'success' as MessageType,
    title: 'messages.SEARCH_SUCCESS.title',
    message: 'messages.SEARCH_SUCCESS.message',
    duration: 4000,
  },
  SEARCH_NO_INPUT: {
    type: 'warning' as MessageType,
    title: 'messages.SEARCH_NO_INPUT.title',
    message: 'messages.SEARCH_NO_INPUT.message',
    duration: 4000,
  },
  SEARCH_INVALID_HEX: {
    type: 'warning' as MessageType,
    title: 'messages.SEARCH_INVALID_HEX.title',
    message: 'messages.SEARCH_INVALID_HEX.message',
    duration: 4000,
  },
  SEARCH_OFFSET_OUT_OF_RANGE: {
    type: 'warning' as MessageType,
    title: 'messages.SEARCH_OFFSET_OUT_OF_RANGE.title',
    message: 'messages.SEARCH_OFFSET_OUT_OF_RANGE.message',
    duration: 4000,
  },

  // 복사 관련
  COPY_SUCCESS: {
    type: 'success' as MessageType,
    title: 'messages.COPY_SUCCESS.title',
    message: 'messages.COPY_SUCCESS.message',
    duration: 3000,
  },
  COPY_FAILED: {
    type: 'error' as MessageType,
    title: 'messages.COPY_FAILED.title',
    message: 'messages.COPY_FAILED.message',
    duration: 5000,
  },

  // 성공 메시지
  FILE_LOADED_SUCCESS: {
    type: 'success' as MessageType,
    title: 'messages.FILE_LOADED_SUCCESS.title',
    message: 'messages.FILE_LOADED_SUCCESS.message',
    duration: 4000,
  },

  // 일반 오류
  UNKNOWN_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.UNKNOWN_ERROR.title',
    message: 'messages.UNKNOWN_ERROR.message',
    duration: 10000,
  },

  // 맵 관련
  ADDRESS_FETCH_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.ADDRESS_FETCH_ERROR.title',
    message: 'messages.ADDRESS_FETCH_ERROR.message',
    duration: 8000,
  },
  LEAFLET_MAP_LOAD_ERROR: {
    type: 'error' as MessageType,
    title: 'messages.LEAFLET_MAP_LOAD_ERROR.title',
    message: 'messages.LEAFLET_MAP_LOAD_ERROR.message',
    duration: 8000,
  },
  LEAFLET_MAP_INVALID_LOCATION: {
    type: 'warning' as MessageType,
    title: 'messages.LEAFLET_MAP_INVALID_LOCATION.title',
    message: 'messages.LEAFLET_MAP_INVALID_LOCATION.message',
    duration: 6000,
  },
} as const;

export type MessageCode = keyof typeof MESSAGES;

/**
 * ✅ 타입 가드 함수 추가
 */
export const isValidMessageCode = (code: string): code is MessageCode => {
  return code in MESSAGES;
};

/**
 * 메시지 템플릿을 반환하는 커스텀 훅
 * next-intl의 useTranslations 훅을 내부에서 사용
 */
export function useMessageTemplate() {
  const t = useTranslations();
  return (code: MessageCode, customMessage?: string): MessageTemplate => {
    const template = MESSAGES[code];
    return {
      ...template,
      title: t(template.title),
      message: customMessage || t(template.message),
    };
  };
}
