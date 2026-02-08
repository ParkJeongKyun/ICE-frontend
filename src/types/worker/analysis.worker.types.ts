/**
 * Analysis Worker 타입
 * Search (HEX/ASCII) + EXIF 처리를 하나의 WASM으로 통합
 */

import { WorkerStats } from './common.worker.types';

// ============================================================================
// Request
// ============================================================================

export type AnalysisWorkerRequestType =
  | 'SEARCH_HEX'
  | 'SEARCH_ASCII'
  | 'PROCESS_EXIF'
  | 'CANCEL_SEARCH'
  | 'RELOAD_WASM';

export interface AnalysisWorkerRequest {
  type: AnalysisWorkerRequestType;
  id: string; // WorkerManager에서 생성한 랜덤 UUID ID (내부 추적 포함)
  file?: File;
  pattern?: string;
  ignoreCase?: boolean;
}

// ============================================================================
// Response Payloads (external use)
// ============================================================================

export interface SearchResult {
  data: {
    indices: Array<{ index: number; offset: number }>;
  };
  stats: WorkerStats;
}

export interface ExifResult {
  data: {
    hasExif: boolean;
    mimeType: string;
    extension: string;
    exifData: string | null;
  };
  stats: WorkerStats;
}

// ============================================================================
// WASM
// ============================================================================

export interface SearchOptions {
  ignoreCase?: boolean;
  maxResults?: number;
}

export type WasmSearchFunction = (
  file: File,
  pattern: Uint8Array,
  options?: SearchOptions
) => any;

export type WasmExifFunction = (data: File) => any;

// ============================================================================
// Global Types (Worker 내부 참조용)
// ============================================================================

declare global {
  interface DedicatedWorkerGlobalScope {
    readBlockSync(
      file: File,
      offset: number,
      length: number
    ): Uint8Array | null;
    Go: typeof Go;
    searchFunc: WasmSearchFunction;
    exifFunc: WasmExifFunction;
  }

  class Go {
    constructor();
    run(instance: WebAssembly.Instance): void;
    importObject: WebAssembly.Imports;
    argv: string[];
    env: Record<string, string>;
    exit(code: number): void;
  }
}
