/// <reference lib="webworker" />

import type {
  WorkerMessage,
  ChunkTask,
  SearchOptions,
  WasmSearchFunction,
  WasmExifFunction,
} from '../types/fileReader.worker';

declare const self: DedicatedWorkerGlobalScope;

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

// ✅ 동시 처리 제한 증가 및 우선순위 큐 추가
const MAX_CONCURRENT = 8;
const queue: ChunkTask[] = [];
let processingCount = 0;
let cancelSearch = false;
let cancelledSearchIds = new Set<number>();

// WASM 관련 변수
let wasmReady = false;
let wasmInitializing = false;
let wasmSearchFunc: WasmSearchFunction | null = null;
let wasmExifFunc: WasmExifFunction | null = null;
let goInstance: any = null;
// Next.js 빌드 타임에 환경변수로 주입됨
let wasmPath = process.env.NEXT_PUBLIC_WASM_PATH;

// Worker 내부에서 WASM 초기화
async function initWasm() {
  if (wasmReady) {
    self.postMessage({ type: 'WASM_READY' });
    return;
  }

  if (wasmInitializing) {
    return;
  }

  wasmInitializing = true;

  try {
    if (goInstance) {
      if (goInstance.exit) {
        try {
          goInstance.exit(0);
        } catch (e) {
          // Cleanup error ignored
        }
      }
      goInstance = null;
    }

    wasmSearchFunc = null;
    wasmExifFunc = null;
    wasmReady = false;

    self.importScripts('/js/wasm_exec.js');

    if (typeof (self as any).Go !== 'function') {
      throw new Error('Go class not found after loading wasm_exec.js');
    }

    const go = new (self as any).Go();
    goInstance = go;

    if (!wasmPath) {
      throw new Error(
        'WASM_PATH_NOT_CONFIGURED: NEXT_PUBLIC_WASM_PATH environment variable is not set'
      );
    }

    const response = await fetch(wasmPath);
    if (!response.ok) {
      throw new Error(
        `WASM_LOAD_FAILED: Failed to load WASM from "${wasmPath}" (HTTP ${response.status} ${response.statusText})`
      );
    }

    const result = await WebAssembly.instantiateStreaming(
      Promise.resolve(response),
      go.importObject
    );

    const wasmReadyPromise = new Promise<void>((resolve) => {
      self.addEventListener('wasmReady', () => resolve(), { once: true });
    });

    go.run(result.instance);

    await Promise.race([
      wasmReadyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WASM INIT TIMEOUT')), 10000)
      ),
    ]);

    wasmSearchFunc = (self as any).searchFunc;
    wasmExifFunc = (self as any).exifFunc;

    if (!wasmSearchFunc || !wasmExifFunc) {
      throw new Error('WASM FUNCTIONS NOT FOUND');
    }

    wasmReady = true;
    wasmInitializing = false;
    self.postMessage({ type: 'WASM_READY' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    wasmReady = false;
    wasmInitializing = false;
    goInstance = null;
    self.postMessage({ type: 'WASM_ERROR', error: errorMessage });
  }
}

initWasm();

async function processQueue() {
  while (processingCount < MAX_CONCURRENT && queue.length > 0) {
    queue.sort((a, b) => a.priority - b.priority);

    processingCount++;
    const task = queue.shift()!;

    try {
      const blob = task.file.slice(task.offset, task.offset + task.length);
      const arrayBuffer = await blob.arrayBuffer();
      // Transfer ArrayBuffer to avoid structured-clone copy (zero-copy)
      self.postMessage(
        {
          type: 'CHUNK_DATA',
          offset: task.offset,
          buffer: arrayBuffer,
        },
        [arrayBuffer]
      );
    } catch (error: any) {
      self.postMessage({
        type: 'ERROR',
        error: error.message,
        offset: task.offset,
      });
    } finally {
      processingCount--;
      processQueue();
    }
  }
}

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const {
    type,
    file,
    offset,
    length,
    priority = offset,
    pattern,
    ignoreCase,
    searchId,
    imageData,
  } = e.data;

  switch (type) {
    case 'CANCEL_SEARCH':
      cancelSearch = true;
      if (searchId !== undefined) {
        cancelledSearchIds.add(searchId);
      }
      break;

    case 'RELOAD_WASM':
      if (!wasmInitializing) {
        wasmReady = false;
        initWasm();
      }
      break;

    case 'SEARCH_HEX':
    case 'SEARCH_ASCII':
      cancelSearch = false;
      if (searchId !== undefined) {
        cancelledSearchIds.forEach((id) => {
          if (id < searchId - 10) {
            cancelledSearchIds.delete(id);
          }
        });
      }
      searchInFile(
        file,
        pattern,
        type === 'SEARCH_HEX' ? 'HEX' : 'ASCII',
        ignoreCase,
        searchId
      );
      break;

    case 'READ_CHUNK':
      queue.push({ file, offset, length, priority });
      processQueue();
      break;

    case 'PROCESS_EXIF':
      processExif(imageData);
      break;
  }
});

// EXIF 처리 함수
async function processExif(imageData: Uint8Array) {
  // ✅ WASM 준비 대기 로직 통일
  const startTime = Date.now();
  const timeout = 3000;

  while (!wasmReady && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!wasmReady || !wasmExifFunc) {
    self.postMessage({
      type: 'EXIF_ERROR',
      errorCode: 'WASM_NOT_READY',
      error: 'WASM module not ready',
    });
    return;
  }

  try {
    const result = wasmExifFunc(imageData);

    if (result.error) {
      self.postMessage({
        type: 'EXIF_ERROR',
        errorCode: 'EXIF_PARSE_ERROR',
        error: result.error,
      });
    } else {
      self.postMessage({ type: 'EXIF_RESULT', result });
    }
  } catch (error) {
    self.postMessage({
      type: 'EXIF_ERROR',
      errorCode: 'EXIF_ERROR',
      error: (error as Error).message,
    });
  }
}

// WASM 기반 검색 (청크 단위)
async function searchInFile(
  file: File,
  pattern: Uint8Array,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false,
  searchId?: number
) {
  const CHUNK_SIZE = 16 * 1024 * 1024;
  const OVERLAP = pattern.length - 1;
  const fileSize = file.size;
  const results: { index: number; offset: number }[] = [];
  const foundIndices = new Set<number>();

  let offset = 0;
  let totalFound = 0;
  const maxResults = 1000;

  // ✅ WASM 준비 대기 로직 통일
  const startTime = Date.now();
  const timeout = 3000;

  while (!wasmReady && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!wasmReady || !wasmSearchFunc) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results: null,
      searchId,
      errorCode: 'WASM_NOT_READY',
      error: 'WASM module not ready',
    });
    return;
  }

  let nextChunkPromise: Promise<Uint8Array> | null = null;

  const loadChunk = async (chunkOffset: number): Promise<Uint8Array> => {
    const effectiveOffset = Math.max(0, chunkOffset - OVERLAP);
    const length = Math.min(CHUNK_SIZE + OVERLAP, fileSize - effectiveOffset);
    const blob = file.slice(effectiveOffset, effectiveOffset + length);
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  let currentChunk = await loadChunk(offset);
  let lastProgressReport = 0;

  while (offset < fileSize && totalFound < maxResults) {
    if (
      cancelSearch &&
      searchId !== undefined &&
      cancelledSearchIds.has(searchId)
    ) {
      return;
    }

    const progress = Math.floor((offset / fileSize) * 100);
    if (progress > lastProgressReport) {
      lastProgressReport = progress;
      self.postMessage({
        type: 'SEARCH_PROGRESS',
        searchId,
        progress,
      });
    }

    const nextOffset = offset + CHUNK_SIZE;
    if (nextOffset < fileSize && !nextChunkPromise) {
      nextChunkPromise = loadChunk(nextOffset);
    }

    let chunkResults: number[] = [];

    try {
      const searchOptions: SearchOptions = {
        ignoreCase: type === 'ASCII' ? ignoreCase : false,
        maxResults: maxResults - totalFound,
      };
      const result = wasmSearchFunc(currentChunk, pattern, searchOptions);

      if (result.error) {
        self.postMessage({
          type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
          results: null,
          searchId,
          errorCode: 'SEARCH_WASM_ERROR',
          error: result.error,
        });
        return;
      }

      chunkResults = result.indices || [];
    } catch (error) {
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        results: null,
        searchId,
        errorCode: 'SEARCH_WASM_ERROR',
        error: (error as Error).message || 'WASM search failed',
      });
      return;
    }

    const effectiveOffset = Math.max(0, offset - OVERLAP);
    for (const idx of chunkResults) {
      const absoluteIndex = effectiveOffset + idx;
      if (!foundIndices.has(absoluteIndex)) {
        foundIndices.add(absoluteIndex);
        results.push({ index: absoluteIndex, offset: pattern.length });
        totalFound++;
        if (totalFound >= maxResults) break;
      }
    }

    if (totalFound >= maxResults) break;

    offset += CHUNK_SIZE;

    if (nextChunkPromise) {
      try {
        currentChunk = await nextChunkPromise;
      } catch (error) {
        console.error('[Worker] Prefetch chunk error:', error);
        break;
      }
      nextChunkPromise = null;
    } else {
      break;
    }
  }

  if (searchId === undefined || !cancelledSearchIds.has(searchId)) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results,
      searchId,
      usedWasm: true,
    });
  }
}

import type {} from 'worker_threads';
