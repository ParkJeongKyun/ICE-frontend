/// <reference lib="webworker" />

import type {
  WorkerMessage,
  WorkerMessageType,
  ChunkTask,
  SearchOptions,
  WasmSearchFunction,
  WasmExifFunction,
} from '../types/fileReader.worker';

declare const self: DedicatedWorkerGlobalScope;

// ✅ 개발 환경에서만 로그
if (process.env.NODE_ENV === 'development') {
  console.log('[Worker] Script loaded');
}

// 전역 에러 핸들러
self.addEventListener('error', (event) => {
  console.error('[Worker] Uncaught error:', event.error);
  self.postMessage({
    type: 'WASM_ERROR',
    error: `Worker error: ${event.error?.message || event.message}`,
  });
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Worker] Unhandled promise rejection:', event.reason);
  self.postMessage({
    type: 'WASM_ERROR',
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

// Worker 내부에서 WASM 초기화
async function initWasm() {
  if (wasmReady) {
    self.postMessage({ type: 'WASM_READY' });
    return;
  }

  if (wasmInitializing) {
    console.log('[Worker] WASM initialization already in progress');
    return;
  }

  wasmInitializing = true;

  try {
    if (goInstance) {
      console.log('[Worker] Cleaning up previous WASM instance');
      if (goInstance.exit) {
        try {
          goInstance.exit(0);
        } catch (e) {
          console.warn('[Worker] Error during Go instance cleanup:', e);
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

    const result = await WebAssembly.instantiateStreaming(
      fetch('/wasm/ice_app.wasm'),
      go.importObject
    );

    const wasmReadyPromise = new Promise<void>((resolve) => {
      self.addEventListener('wasmReady', () => resolve(), { once: true });
    });

    go.run(result.instance);

    await Promise.race([
      wasmReadyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WASM 초기화 타임아웃')), 10000)
      ),
    ]);

    wasmSearchFunc = (self as any).searchFunc;
    wasmExifFunc = (self as any).exifFunc;

    if (!wasmSearchFunc || !wasmExifFunc) {
      throw new Error('WASM 함수가 등록되지 않았습니다');
    }

    wasmReady = true;
    wasmInitializing = false;
    console.log('[Worker] ✅ WASM loaded successfully');
    self.postMessage({ type: 'WASM_READY' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Worker] ❌ WASM load failed:', errorMessage);
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
      const data = new Uint8Array(arrayBuffer);

      self.postMessage({
        type: 'CHUNK_DATA',
        offset: task.offset,
        data,
      });
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
        console.log(`[Worker] Search ${searchId} cancelled`);
      }
      break;

    case 'RELOAD_WASM':
      if (!wasmInitializing) {
        wasmReady = false;
        initWasm();
      } else {
        console.warn(
          '[Worker] WASM is already initializing, ignoring RELOAD_WASM'
        );
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
  const startTime = Date.now();
  while (!wasmReady && Date.now() - startTime < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!wasmReady || !wasmExifFunc) {
    self.postMessage({ type: 'EXIF_ERROR', error: 'WASM not ready' });
    return;
  }

  try {
    const result = wasmExifFunc(imageData);
    
    // 심각한 에러만 EXIF_ERROR로 처리
    if (result.error) {
      self.postMessage({ type: 'EXIF_ERROR', error: result.error });
    } else {
      // EXIF 데이터가 없어도 정상 응답
      self.postMessage({ type: 'EXIF_RESULT', result });
    }
  } catch (error) {
    self.postMessage({ type: 'EXIF_ERROR', error: (error as Error).message });
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

  // WASM 준비 대기
  const startTime = Date.now();
  while (!wasmReady && Date.now() - startTime < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // ✅ WASM이 준비되지 않았으면 검색 중단
  if (!wasmReady || !wasmSearchFunc) {
    console.error('[Worker] WASM not ready, search aborted');
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results: null,
      searchId,
      error: 'WASM not ready',
    });
    return;
  }

  console.log('[Worker] Search using WASM');

  let nextChunkPromise: Promise<Uint8Array> | null = null;

  const loadChunk = async (chunkOffset: number): Promise<Uint8Array> => {
    const effectiveOffset = Math.max(0, chunkOffset - OVERLAP);
    const length = Math.min(CHUNK_SIZE + OVERLAP, fileSize - effectiveOffset);
    const blob = file.slice(effectiveOffset, effectiveOffset + length);
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  let currentChunk = await loadChunk(offset);

  while (offset < fileSize && totalFound < maxResults) {
    if (
      cancelSearch &&
      searchId !== undefined &&
      cancelledSearchIds.has(searchId)
    ) {
      console.log(`[Worker] Search ${searchId} aborted`);
      return;
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
      
      // Handle both error and indices
      if (result.error) {
        console.error('[Worker] WASM search error:', result.error);
        self.postMessage({
          type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
          results: null,
          searchId,
          error: result.error,
        });
        return;
      }
      
      chunkResults = result.indices || [];
    } catch (error) {
      console.error('[Worker] WASM search error:', error);
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        results: null,
        searchId,
        error: 'WASM search failed',
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
