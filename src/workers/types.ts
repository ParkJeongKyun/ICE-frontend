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

export interface WasmSearchFunction {
  (
    data: Uint8Array,
    pattern: Uint8Array,
    options?: SearchOptions
  ): { indices?: number[] };
}

export interface WasmExifFunction {
  (data: Uint8Array): any;
}
