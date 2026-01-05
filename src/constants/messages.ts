import { MessageType } from '@/contexts/MessageContext';

export interface MessageTemplate {
  type: MessageType;
  title: string;
  message: string;
  duration: number;
}

export const ERROR_MESSAGES = {
  // Worker 관련
  WORKER_NOT_INITIALIZED: {
    type: 'error' as MessageType,
    title: '워커 오류',
    message: '워커가 초기화되지 않았습니다.\n페이지를 새로고침해주세요.',
    duration: 5000,
  },
  WASM_LOADING: {
    type: 'warning' as MessageType,
    title: 'WASM 로딩 중',
    message: 'WASM이 로딩 중입니다.\n잠시 후 다시 시도해주세요.',
    duration: 3000,
  },
  WASM_LOAD_FAILED: {
    type: 'error' as MessageType,
    title: 'WASM 로드 실패',
    message: 'WASM 모듈을 로드하는데 실패했습니다.\n페이지를 새로고침해주세요.',
    duration: 5000,
  },

  // 파일 처리 관련
  FILE_PROCESSING_FAILED: {
    type: 'error' as MessageType,
    title: '파일 처리 실패',
    message: '파일을 처리하는 중 오류가 발생했습니다.',
    duration: 5000,
  },
  FILE_READ_FAILED: {
    type: 'error' as MessageType,
    title: '파일 읽기 실패',
    message: '파일을 읽을 수 없습니다.\n파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.',
    duration: 5000,
  },
  FILE_TOO_LARGE: {
    type: 'warning' as MessageType,
    title: '파일 크기 초과',
    message: '파일 크기가 너무 큽니다.\n최대 지원 크기는 100MB입니다.',
    duration: 4000,
  },
  EXIF_PROCESSING_TIMEOUT: {
    type: 'error' as MessageType,
    title: 'EXIF 처리 시간 초과',
    message: 'EXIF 데이터 처리 시간이 초과되었습니다.\n다시 시도해주세요.',
    duration: 5000,
  },

  // 성공 메시지
  FILE_LOADED_SUCCESS: {
    type: 'success' as MessageType,
    title: '파일 로드 완료',
    message: '파일이 성공적으로 로드되었습니다.',
    duration: 2000,
  },

  // 일반 오류
  UNKNOWN_ERROR: {
    type: 'error' as MessageType,
    title: '알 수 없는 오류',
    message: '알 수 없는 오류가 발생했습니다.\n다시 시도해주세요.',
    duration: 5000,
  },
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export const getErrorMessage = (
  code: ErrorCode,
  customMessage?: string
): MessageTemplate => {
  const template = ERROR_MESSAGES[code];
  return customMessage
    ? { ...template, message: customMessage }
    : template;
};
