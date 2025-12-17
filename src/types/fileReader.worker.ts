declare global {
  class Go {
    constructor();
    run(instance: WebAssembly.Instance): Promise<void>;
    importObject: any;
    argv: string[];
    env: any;
    exited: boolean;
    exit(code: number): void;
    _pendingEvent: any;
    _resume(): void;
  }
}

export type WorkerMessageType =
  | 'CANCEL_SEARCH'
  | 'RELOAD_WASM'
  | 'SEARCH_HEX'
  | 'SEARCH_ASCII'
  | 'READ_CHUNK'
  | 'PROCESS_EXIF'
  | 'CHUNK_DATA'
  | 'SEARCH_RESULT_HEX'
  | 'SEARCH_RESULT_ASCII'
  | 'EXIF_RESULT'
  | 'EXIF_ERROR'
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
  indices?: number[];
  error?: string;
}

export interface WasmSearchFunction {
  (
    data: Uint8Array,
    pattern: Uint8Array,
    options?: SearchOptions
  ): SearchResult;
}

export interface ExifResult {
  error?: string;
  exif_data?: string;
  mime_type?: string;
  extension?: string;
}

export interface WasmExifFunction {
  (data: Uint8Array): ExifResult;
}
