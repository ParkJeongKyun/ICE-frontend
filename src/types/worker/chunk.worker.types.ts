/**
 * Chunk Worker 타입
 */

// ============================================================================
// Request
// ============================================================================

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

// ============================================================================
// Response (StandardWorkerResponse 형식 사용)
// ============================================================================

/**
 * Chunk Worker 응답 데이터
 * status: 'SUCCESS' -> data: ChunkSuccessData
 * status: 'ERROR' -> data: ChunkErrorData
 */
export interface ChunkSuccessData {
  offset: number;
  buffer: ArrayBuffer;
}

export interface ChunkErrorData {
  offset: number;
}
