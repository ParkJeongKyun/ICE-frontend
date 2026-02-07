/// <reference lib="webworker" />

import { CHUNK_SIZE } from '@/constants/hexViewer';

declare const self: DedicatedWorkerGlobalScope;

const syncReader = new FileReaderSync();

interface ChunkRequest {
  file: File;
  offset: number;
  length: number;
  priority: number;
}

const queue: ChunkRequest[] = [];
let processing = false;
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

async function processChunk(request: ChunkRequest) {
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
self.addEventListener('message', (e) => {
  const { type, file, offset, length, priority } = e.data;

  switch (type) {
    case 'READ_CHUNK':
      queue.push({ file, offset, length, priority });
      processQueue();
      break;

    case 'CLEAR_QUEUE':
      queue.length = 0;
      break;
  }
});
