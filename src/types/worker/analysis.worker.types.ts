/**
 * Analysis Worker 타입
 * Search (HEX/ASCII) + EXIF 처리를 하나의 WASM으로 통합
 */

import { WorkerStats } from './index.worker.types';
import { ExifInfo, TextChunkInfo } from '@/types';

// ============================================================================
// Request
// ============================================================================

export type AnalysisWorkerRequestType =
  | 'SEARCH_HEX'
  | 'SEARCH_ASCII'
  | 'PROCESS_EXIF';

export interface AnalysisWorkerRequest {
  type: AnalysisWorkerRequestType;
  id: string; // WorkerManager에서 생성한 랜덤 UUID ID (내부 추적 포함)
  file?: File;
  pattern?: Uint8Array; // Uint8Array로 변경
  ignoreCase?: boolean;
}

// ============================================================================
// Response Payloads (external use)
// ============================================================================

export interface SearchResult {
  data: {
    indices: Array<{ index: number; offset: number }>;
  };
  stats?: WorkerStats; // optional로 변경 (ExecuteResponse와 일치)
}

export interface ExifResult {
  data: {
    hasExif: boolean;
    mimeType: string;
    extension: string;
    exifInfo: ExifInfo;
    textChunkData?: TextChunkInfo;
  };
  stats?: WorkerStats; // optional로 변경 (ExecuteResponse와 일치)
}

// ============================================================================
// WASM
// ============================================================================

export interface SearchOptions {
  ignoreCase?: boolean;
  maxResults?: number;
}

// ============================================================================
// WASM Response Types
// ============================================================================

export interface WasmSearchResponse {
  indices: string;
  error?: string;
}

export interface WasmExifResponse {
  mimeType: string;
  extension: string;
  typeDetected: boolean;
  hasExif: boolean;
  isEmpty: boolean;
  exifData?: string;
  error?: string;
}

// PNG 메타데이터 응답 (EXIF와 동일한 패턴: JSON 문자열)
export interface WasmTextChunkResponse {
  hasTextChunks: boolean;
  textChunkData?: string;
  error?: string;
}

export type WasmSearchFunction = (
  file: File,
  pattern: Uint8Array,
  options?: SearchOptions
) => WasmSearchResponse;

export type WasmExifFunction = (data: File) => WasmExifResponse;

// PNG 메타데이터 함수 (EXIF와 동일하게 JSON 문자열 반환)
export type WasmTextChunkFunction = (data: File) => WasmTextChunkResponse;
