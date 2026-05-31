/// <reference lib="webworker" />

import {
  ChunkWorkerRequest,
  ReadChunkRequest,
} from '@/types/worker/chunk.worker.types';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 청크 워커 클래스
 * 파일 청크 읽기 및 큐 관리
 */
class ChunkWorker {
  // Array 대신 Map을 사용하여 offset을 key로 관리
  private queueMap: Map<number, ReadChunkRequest> = new Map();
  private readonly MAX_CONCURRENT = 4;
  private activeRequests = 0;

  /**
   * 큐 처리
   */
  private processQueue(): void {
    // 동시 처리 한도를 채웠거나 큐가 비어있으면 종료
    if (this.activeRequests >= this.MAX_CONCURRENT || this.queueMap.size === 0) {
      return;
    }

    // Map의 값들을 배열로 변환 후 우선순위(Priority)로 정렬
    const pendingRequests = Array.from(this.queueMap.values());
    pendingRequests.sort((a, b) => a.priority - b.priority);

    for (const request of pendingRequests) {
      // 동시 처리 한도에 도달하면 루프 중단
      if (this.activeRequests >= this.MAX_CONCURRENT) break;

      // 큐에서 꺼낸 항목은 Map에서 제거하고 처리 시작
      this.queueMap.delete(request.offset);
      this.activeRequests++;
      this.processChunk(request);
    }
  }

  /**
   * 청크 처리
   */
  private async processChunk(request: ReadChunkRequest): Promise<void> {
    try {
      const { file, offset, length } = request;
      const blob = file.slice(offset, offset + length);
      const buffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      self.postMessage(
        {
          status: 'SUCCESS',
          data: {
            offset,
            buffer: uint8.buffer,
          },
        },
        [uint8.buffer]
      );
    } catch (error) {
      self.postMessage({
        status: 'ERROR',
        data: {
          offset: request.offset,
        },
        errorCode: 'CHUNK_READ_ERROR',
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
    if (data.type === 'READ_CHUNK') {
      // Map을 사용하면 O(1) 시간 복잡도로 즉시 삽입 또는 업데이트 (중복 방지)
      this.queueMap.set(data.offset, data);
      this.processQueue();
    } else if (data.type === 'CANCEL_ALL') {
      // 큐 비우기도 훨씬 간단해짐
      this.queueMap.clear();
      if (process.env.NODE_ENV === 'development') {
        console.log('[Chunk Worker] Queue cleared - CANCEL_ALL');
      }
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
const chunkWorker = new ChunkWorker();
self.addEventListener('message', (e: MessageEvent<ChunkWorkerRequest>) => {
  chunkWorker.handle(e.data as ChunkWorkerRequest);
});
