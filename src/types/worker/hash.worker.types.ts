/**
 * Hash Worker 타입
 */

import { WorkerStats } from './common.worker.types';

// Request
export type HashWorkerRequestType = 'PROCESS_HASH';

export interface HashWorkerRequest {
  type: HashWorkerRequestType;
  id: string; // WorkerManager에서 생성한 랜덤 UUID ID
  file: File;
}

// Response
export type HashWorkerResponseType =
  | 'HASH_PROGRESS'
  | 'HASH_RESULT'
  | 'HASH_ERROR';

export interface HashWorkerResponse {
  type: HashWorkerResponseType;
  stats?: WorkerStats;
  [key: string]: any;
}

// Payloads
export interface HashProgress {
  progress: number;
  speed: number;
  eta: number;
  stats: WorkerStats;
}

export interface HashResult {
  data: {
    hash: string;
  };
  stats: WorkerStats;
}
