/**
 * Chunk Worker 타입
 */

// Request
export type ChunkWorkerRequestType = 'READ_CHUNK' | 'CANCEL_ALL';

export interface ReadChunkRequest {
  type: 'READ_CHUNK';
  file: File;
  offset: number;
  length: number;
  priority: number;
}

export interface CancelAllRequest {
  type: 'CANCEL_ALL';
}

export type ChunkWorkerRequest = ReadChunkRequest | CancelAllRequest;

// Response
export type ChunkWorkerResponseType = 'CHUNK_DATA' | 'CHUNK_ERROR' | 'ERROR';

export interface ChunkDataResponse {
  type: 'CHUNK_DATA';
  offset: number;
  buffer: ArrayBuffer;
}

export interface ChunkErrorResponse {
  type: 'CHUNK_ERROR' | 'ERROR';
  offset: number;
  errorCode: string;
}

export type ChunkWorkerResponse = ChunkDataResponse | ChunkErrorResponse;

// Payload
export interface ChunkData {
  offset: number;
  buffer: ArrayBuffer;
}
