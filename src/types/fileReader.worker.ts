export type WorkerMessageType =
  | 'CANCEL_SEARCH'
  | 'RELOAD_WASM'
  | 'SEARCH_HEX'
  | 'SEARCH_ASCII'
  | 'READ_CHUNK'
  | 'PROCESS_EXIF'
  | 'PROCESS_HASH'
  | 'CHUNK_DATA'
  | 'SEARCH_RESULT_HEX'
  | 'SEARCH_RESULT_ASCII'
  | 'EXIF_RESULT'
  | 'EXIF_ERROR'
  | 'HASH_RESULT'
  | 'HASH_ERROR'
  | 'WASM_READY'
  | 'WASM_ERROR'
  | 'ERROR';

export interface WorkerMessage {
  type: WorkerMessageType;
  [key: string]: any;
}

export interface ChunkTask {
  file: File;
  offset: number;
  length: number;
  priority: number;
}

export interface SearchOptions {
  ignoreCase?: boolean;
  maxResults?: number;
}

export interface SearchResult {
  indices: number[];
  error?: string;
}

export interface WasmSearchFunction {
  (file: File, pattern: Uint8Array, options?: SearchOptions): SearchResult;
}

/**
 * EXIF 처리 결과
 * - error: 치명적 에러 발생 시에만 설정 (예: 데이터 없음)
 * - is_empty: 빈 파일인 경우 true
 * - type_detected: 파일 타입 감지 성공 여부
 * - has_exif: EXIF 데이터 존재 여부
 * - mime_type: MIME 타입 (감지 실패 시 "application/octet-stream")
 * - extension: 파일 확장자 (감지 실패 시 빈 문자열)
 * - exif_data: EXIF JSON 데이터 (없으면 null)
 */
export interface ExifResult {
  error?: string; // 심각한 에러 (데이터 없음 등)
  isEmpty?: boolean; // 빈 파일 여부
  typeDetected?: boolean; // 파일 타입 감지 성공 여부
  hasExif?: boolean; // EXIF 데이터 존재 여부
  mimeType?: string; // MIME 타입 (알 수 없으면 "application/octet-stream")
  extension?: string; // 확장자 (알 수 없으면 빈 문자열)
  exifData?: string | null; // EXIF JSON 데이터 (없으면 null)
}

export interface WasmExifFunction {
  (data: File): ExifResult;
}

/**
 * 파일 무결성 검증용 SHA-256 해시 결과
 * - hash: SHA-256 16진수 문자열 (64자, 예: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e")
 * - error: 에러 발생 시에만 설정
 */
export interface HashResult {
  hash?: string | null; // SHA-256 해시값 (16진수 64자)
  error?: string; // 에러 메시지
}
