/// <reference lib="webworker" />

import { createSHA256 } from 'hash-wasm';

declare const self: DedicatedWorkerGlobalScope;

// ✅ [최종 최적화] Streams API를 사용한 물리적 한계 속도 해시 계산
async function processHash(id: number, file: File) {
  try {
    const startTime = performance.now();

    // 1. WASM 해셔 생성
    const hasher = await createSHA256();
    hasher.init();

    // ✅ [핵심] Streams API 사용
    // 브라우저가 알아서 적절한 크기(보통 64KB ~ 1MB)로 읽어옵니다.
    const stream = file.stream();
    const reader = stream.getReader();

    let totalRead = 0;
    let lastReportBytes = 0;
    let lastReportTime = performance.now();
    const PROGRESS_INTERVAL_BYTES = 1024 * 1024; // 1MB
    const PROGRESS_INTERVAL_MS = 500; // 0.5s

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
          id,
          progress,
          speed: `${speedVal.toFixed(2)} MB/s`,
          eta,
          processedBytes: totalRead,
        });

        lastReportBytes = totalRead;
        lastReportTime = now;
      }
    }

    const hashHex = hasher.digest();

    // 결과 출력
    const duration = (performance.now() - startTime) / 1000;
    const speed = (file.size / 1024 / 1024 / duration).toFixed(2);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Stream Hash] File: ${file.name}`);
      console.log(`- Time: ${duration.toFixed(3)}s`);
      console.log(`- Speed: ${speed} MB/s`);
    }

    // Final progress = 100%
    self.postMessage({
      type: 'HASH_PROGRESS',
      id,
      progress: 100,
      speed: `${speed} MB/s`,
      eta: 0,
      processedBytes: file.size,
    });

    self.postMessage({ type: 'HASH_RESULT', id, result: { hash: hashHex } });
  } catch (error) {
    self.postMessage({
      type: 'HASH_ERROR',
      id,
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
self.addEventListener('message', (e) => {
  const { type, id, file } = e.data;

  switch (type) {
    case 'PROCESS_HASH':
      if (file && file instanceof File) {
        processHash(id, file);
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
