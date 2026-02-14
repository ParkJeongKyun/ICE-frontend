/**
 * Hash Worker 타입
 */

import { WorkerStats } from './index.worker.types';

// Request
export type HashWorkerRequestType = 'PROCESS_HASH';
export type HashType = 'sha256' | 'sha512' | 'md5' | 'sha1';

export interface HashWorkerRequest {
  type: HashWorkerRequestType;
  id: string; // WorkerManager에서 생성한 랜덤 UUID ID
  file: File;
  hashType?: HashType; // 기본값: sha256
}

export interface HashResult {
  data: {
    hash: string;
    hashType: HashType;
  };
  stats?: WorkerStats; // optional로 변경 (ExecuteResponse와 일치)
}
