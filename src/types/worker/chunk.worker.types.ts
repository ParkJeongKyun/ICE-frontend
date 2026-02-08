/**
 * Chunk Worker 타입
 */

// Request
export type ChunkWorkerRequestType = 'READ_CHUNK';

export interface ChunkWorkerRequest {
  type: ChunkWorkerRequestType;
  file: File;
  offset: number;
  length: number;
  priority: number;
}

// Response
export type ChunkWorkerResponseType = 'CHUNK_DATA' | 'CHUNK_ERROR' | 'ERROR';

export interface ChunkWorkerResponse {
  type: ChunkWorkerResponseType;
  [key: string]: any;
}

// Payload
export interface ChunkData {
  offset: number;
  buffer: ArrayBuffer;
}
