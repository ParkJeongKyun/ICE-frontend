/// <reference lib="webworker" />

import { createSHA256, createSHA512, createMD5, createSHA1 } from 'hash-wasm';
import type {
  HashWorkerRequest,
  HashType,
} from '@/types/worker/hash.worker.types';
import { createStats, calculateProgressInterval } from './workerUtils';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 해시 타입에 따른 해셔 생성
 */
async function createHasher(hashType: HashType) {
  switch (hashType) {
    case 'sha256':
      return createSHA256();
    case 'sha512':
      return createSHA512();
    case 'md5':
      return createMD5();
    case 'sha1':
      return createSHA1();
    default:
      throw new Error(`Unsupported hash type: ${hashType}`);
  }
}

// ✅ [최종 최적화] Streams API를 사용한 물리적 한계 속도 해시 계산
async function processHash(
  id: string,
  file: File,
  hashType: HashType = 'sha256'
) {
  try {
    const startTime = performance.now();

    // 1. WASM 해셔 생성 (해시 타입별로)
    const hasher = await createHasher(hashType);
    hasher.init();

    // ✅ [핵심] Streams API 사용
    // 브라우저가 알아서 적절한 크기(보통 64KB ~ 1MB)로 읽어옵니다.
    const stream = file.stream();
    const reader = stream.getReader();

    let totalRead = 0;
    let lastReportBytes = 0;
    let lastReportTime = performance.now();

    // 동적 진행률 보고 간격
    const interval = calculateProgressInterval(file.size);
    const PROGRESS_INTERVAL_BYTES = interval.bytes;
    const PROGRESS_INTERVAL_MS = interval.ms;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // value는 Uint8Array입니다. 바로 주입합니다.
      hasher.update(value);

      totalRead += value.length;

      // 주기적으로 진행률 전송
      const now = performance.now();
      const bytesSince = totalRead - lastReportBytes;
      const msSince = now - lastReportTime;
      if (
        bytesSince >= PROGRESS_INTERVAL_BYTES ||
        msSince >= PROGRESS_INTERVAL_MS
      ) {
        const duration = (now - startTime) / 1000;
        const speedVal = duration > 0 ? totalRead / 1024 / 1024 / duration : 0; // MB/s
        const progress = Math.min(
          100,
          Math.round((totalRead / file.size) * 100)
        );
        const eta =
          speedVal > 0
            ? Math.round((file.size - totalRead) / 1024 / 1024 / speedVal)
            : 0;

        self.postMessage({
          type: 'HASH_PROGRESS',
          stats: createStats(
            id,
            now - startTime,
            totalRead,
            file.size,
            file.name,
            progress,
            eta
          ),
        });

        lastReportBytes = totalRead;
        lastReportTime = now;
      }
    }

    const hashHex = hasher.digest();

    // Final progress = 100%
    self.postMessage({
      type: 'HASH_PROGRESS',
      stats: createStats(
        id,
        performance.now() - startTime,
        file.size,
        file.size,
        file.name,
        100,
        0
      ),
    });

    // Include basic stats with the final result so callers can show summary info
    self.postMessage({
      type: 'HASH_RESULT',
      stats: createStats(
        id,
        performance.now() - startTime,
        file.size,
        file.size,
        file.name
      ),
      data: {
        hash: hashHex,
        hashType,
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'HASH_ERROR',
      stats: {
        id,
      },
      error: (error as Error).message,
    });
  }
}

// 전역 에러 핸들러
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'ERROR',
    errorCode: 'WORKER_ERROR',
    error: event.error?.message || event.message,
  });
});

self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'ERROR',
    errorCode: 'WORKER_ERROR',
    error: `Promise rejection: ${event.reason}`,
  });
});

// Message 핸들러
self.addEventListener('message', (e: MessageEvent<HashWorkerRequest>) => {
  const { type, id, file, hashType = 'sha256' } = e.data;

  switch (type) {
    case 'PROCESS_HASH':
      if (file && file instanceof File) {
        processHash(id, file, hashType);
      } else {
        self.postMessage({
          type: 'HASH_ERROR',
          id,
          error: 'File object is invalid or undefined',
        });
      }
      break;
  }
});
