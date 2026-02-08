/**
 * Worker 타입 통합 내보내기
 * @example import type { HashWorkerRequest } from '@/types/worker'
 */

// Common Worker Types
export type {
  WorkerStats,
  ProgressPayload,
} from './worker/common.worker.types';
export type {
  HashWorkerRequestType,
  HashWorkerRequest,
  HashWorkerResponseType,
  HashWorkerResponse,
  HashProgress,
  HashResult,
} from './worker/hash.worker.types';

// Analysis Worker
export type {
  AnalysisWorkerRequestType,
  AnalysisWorkerRequest,
  SearchResult,
  ExifResult,
  SearchOptions,
  WasmSearchFunction,
  WasmExifFunction,
} from './worker/analysis.worker.types';

// Chunk Worker
export type {
  ChunkWorkerRequestType,
  ChunkWorkerRequest,
  ChunkWorkerResponseType,
  ChunkWorkerResponse,
  ChunkData,
} from './worker/chunk.worker.types';
