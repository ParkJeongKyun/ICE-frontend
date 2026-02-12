/// <reference lib="webworker" />

import { ChunkWorkerRequest } from '@/types/worker/chunk.worker.types';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 청크 워커 클래스
 * 파일 청크 읽기 및 큐 관리
 */
class ChunkWorker {
  private queue: ChunkWorkerRequest[] = [];
  private readonly MAX_CONCURRENT = 4;
  private activeRequests = 0;

  /**
   * 큐 처리
   */
  private processQueue(): void {
    // 우선순위로 정렬
    this.queue.sort((a, b) => a.priority - b.priority);

    while (this.queue.length > 0 && this.activeRequests < this.MAX_CONCURRENT) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      this.processChunk(request);
    }
  }

  /**
   * 청크 처리
   */
  private async processChunk(request: ChunkWorkerRequest): Promise<void> {
    try {
      const { file, offset, length } = request;
      const blob = file.slice(offset, offset + length);
      const buffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      self.postMessage(
        {
          type: 'CHUNK_DATA',
          offset,
          buffer: uint8.buffer,
        },
        [uint8.buffer]
      );
    } catch (error) {
      self.postMessage({
        type: 'CHUNK_ERROR',
        offset: request.offset,
      });
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * 메시지 핸들러
   */
  handle(data: ChunkWorkerRequest): void {
    const { type, file, offset, length, priority } = data;

    if (type === 'READ_CHUNK') {
      this.queue.push({ type, file, offset, length, priority });
      this.processQueue();
    }
  }
}

// 전역 에러 핸들러
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'ERROR',
    errorCode: 'WORKER_ERROR',
  });
});

self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'ERROR',
    errorCode: 'WORKER_ERROR',
  });
});

// 워커 인스턴스 생성 및 메시지 리스너 등록
const chunkWorker = new ChunkWorker();
self.addEventListener('message', (e: MessageEvent<ChunkWorkerRequest>) => {
  chunkWorker.handle(e.data as ChunkWorkerRequest);
});
