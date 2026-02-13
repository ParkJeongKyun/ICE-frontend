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

// Payload
export interface ChunkData {
  offset: number;
  buffer: ArrayBuffer;
}
