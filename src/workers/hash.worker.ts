/// <reference lib="webworker" />

import { createSHA256, createSHA512, createMD5, createSHA1 } from 'hash-wasm';
import type {
  HashWorkerRequest,
  HashType,
} from '@/types/worker/hash.worker.types';
import { createStats, calculateProgressInterval } from './utils';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 해시 워커 클래스
 * 파일 해시 계산 및 진행률 추적
 */
class HashWorker {
  /**
   * 취소 요청 추적 (타임아웃으로 인한 soft cancel)
   */
  private cancelledIds = new Set<string>();

  /**
   * 해시 타입에 따른 해셔 생성
   */
  private static async createHasher(hashType: HashType) {
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

  /**
   * 해시 계산 처리
   */
  async process(
    id: string,
    file: File,
    hashType: HashType = 'sha256'
  ): Promise<void> {
    try {
      const startTime = performance.now();

      // 1. WASM 해셔 생성 (해시 타입별로)
      const hasher = await HashWorker.createHasher(hashType);
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
        // ✅ [우선순위 1] 취소 요청 확인 (타임아웃)
        if (this.cancelledIds.has(id)) {
          reader.cancel(); // 스트림 읽기 취소
          this.cancelledIds.delete(id); // 메모리 정리
          return; // 작업 중단
        }

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
          this.sendProgress(id, file, totalRead, now - startTime);

          lastReportBytes = totalRead;
          lastReportTime = now;
        }
      }

      const hashHex = hasher.digest();

      // Final update
      this.sendProgress(id, file, file.size, performance.now() - startTime);

      // Include basic stats with the final result so callers can show summary info
      this.sendResult(
        id,
        file,
        hashHex,
        hashType,
        performance.now() - startTime
      );
    } catch (error) {
      this.sendError(id, 'HASH_ERROR');
    }
  }

  /**
   * 진행률 메시지 전송 (StandardWorkerResponse 형식)
   */
  private sendProgress(
    id: string,
    file: File,
    totalRead: number,
    duration: number
  ): void {
    self.postMessage({
      status: 'PROGRESS',
      taskType: 'PROCESS_HASH',
      stats: createStats(id, duration, totalRead, file.size, file.name),
    });
  }

  /**
   * 최종 결과 전송 (StandardWorkerResponse 형식)
   */
  private sendResult(
    id: string,
    file: File,
    hash: string,
    hashType: HashType,
    duration: number
  ): void {
    self.postMessage({
      status: 'SUCCESS',
      taskType: 'PROCESS_HASH',
      stats: createStats(id, duration, file.size, file.size, file.name),
      data: {
        hash,
        hashType,
      },
    });
  }

  /**
   * 에러 메시지 전송 (StandardWorkerResponse 형식)
   */
  private sendError(id: string, errorCode: string): void {
    self.postMessage({
      id, // 🚀 루트에 id 직접 삽입
      status: 'ERROR',
      taskType: 'PROCESS_HASH',
      errorCode,
    });
  }

  /**
   * 메시지 핸들러
   */
  handle(data: HashWorkerRequest): void {
    const { type, id, file, hashType = 'sha256' } = data;

    switch (type) {
      case 'CANCEL': // ✅ 타임아웃 시 워커 취소 신호
        this.cancelledIds.add(id);
        break;
      case 'PROCESS_HASH':
        if (file && file instanceof File) {
          this.process(id, file, hashType);
        } else {
          this.sendError(id, 'HASH_ERROR');
        }
        break;
    }
  }
}

// 전역 에러 핸들러 (StandardWorkerResponse 형식)
self.addEventListener('error', (event) => {
  self.postMessage({
    status: 'ERROR',
    errorCode: 'WORKER_ERROR',
  });
});

self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    status: 'ERROR',
    errorCode: 'WORKER_ERROR',
  });
});

// 워커 인스턴스 생성 및 메시지 리스너 등록
const hashWorker = new HashWorker();
self.addEventListener('message', (e: MessageEvent<HashWorkerRequest>) => {
  hashWorker.handle(e.data as HashWorkerRequest);
});
