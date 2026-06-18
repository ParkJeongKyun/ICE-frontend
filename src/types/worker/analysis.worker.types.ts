/**
 * Analysis Worker 타입
 * Search (HEX/ASCII) + EXIF 처리를 하나의 WASM으로 통합
 */

import { WorkerStats } from './index.worker.types';
import { ExifInfo, TextChunkInfo, PeInfo } from '@/types';

// ============================================================================
// Request
// ============================================================================

export type AnalysisWorkerRequestType =
  | 'SEARCH_HEX'
  | 'SEARCH_ASCII'
  | 'PROCESS_ANALYSIS'
  | 'LOAD_PLUGIN';

export type PluginType = 'image' | 'pe';

export interface LoadPluginRequest {
  type: 'LOAD_PLUGIN';
  id: string;
  pluginType: PluginType;
  path: string;
}

export interface AnalysisWorkerRequest {
  type: AnalysisWorkerRequestType;
  id: string; // WorkerManager에서 생성한 랜덤 UUID ID (내부 추적 포함)
  file?: File;
  pattern?: Uint8Array; // Uint8Array로 변경
  ignoreCase?: boolean;
  pluginType?: PluginType;
  path?: string;
  options?: {
    enabled?: boolean;
    mimeType?: string;
    extension?: string;
    image?: {
      enabled: boolean;
      exif: boolean;
      textChunk: boolean;
    };
    pe?: boolean;
  };
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

export interface AnalysisResult {
  data: {
    mimeType: string;
    extension: string;
    exifInfo?: ExifInfo;
    textChunkData?: TextChunkInfo;
    peData?: PeInfo;
    engines: {
      core: boolean;
      image: boolean;
      pe: boolean;
    };
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

export interface WasmResponse<T = any> {
  success: boolean;
  found: boolean;
  isEmpty: boolean;
  data: T;
  error: string;
}

export type WasmSearchResponse = WasmResponse<string>; // JSON string of indices

export type WasmExifResponse = WasmResponse<string>; // JSON string of exifData

export type WasmTextChunkResponse = WasmResponse<string>; // JSON string of textChunkData

export interface WasmDetectTypeData {
  mimeType: string;
  extension: string;
}
export type WasmDetectTypeResponse = WasmResponse<WasmDetectTypeData>;

export type WasmDetectTypeFunction = (file: File) => WasmDetectTypeResponse;

export type WasmSearchFunction = (
  file: File,
  pattern: Uint8Array,
  options?: SearchOptions
) => WasmSearchResponse;

export type WasmExifFunction = (
  data: File,
  mimeType: string,
  extension: string
) => WasmExifResponse;

export type WasmPeResponse = WasmResponse<string>; // JSON string of PeInfo

export type WasmPeFunction = (
  data: File,
  mimeType: string,
  extension: string
) => WasmPeResponse;

// PNG 메타데이터 함수 (EXIF와 동일하게 JSON 문자열 반환)
export type WasmTextChunkFunction = (
  data: File,
  mimeType: string,
  extension: string
) => WasmTextChunkResponse;
