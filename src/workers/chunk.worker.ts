/// <reference lib="webworker" />

import { ChunkWorkerRequest } from '@/types/worker/chunk.worker.types';

declare const self: DedicatedWorkerGlobalScope;

const queue: ChunkWorkerRequest[] = [];
const MAX_CONCURRENT = 4;
let activeRequests = 0;

function processQueue() {
  // 우선순위로 정렬
  queue.sort((a, b) => a.priority - b.priority);

  while (queue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const request = queue.shift();
    if (!request) break;

    activeRequests++;
    processChunk(request);
  }
}

async function processChunk(request: ChunkWorkerRequest) {
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
      error: (error as Error).message,
    });
  } finally {
    activeRequests--;
    processQueue();
  }
}

// 전역 에러 핸들러
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'ERROR',
    error: event.error?.message || event.message,
  });
});

self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'ERROR',
    error: `Promise rejection: ${event.reason}`,
  });
});

// Message 핸들러
self.addEventListener('message', (e: MessageEvent<ChunkWorkerRequest>) => {
  const { type, file, offset, length, priority } = e.data;

  if (type === 'READ_CHUNK') {
    queue.push({ type, file, offset, length, priority });
    processQueue();
  }
});
