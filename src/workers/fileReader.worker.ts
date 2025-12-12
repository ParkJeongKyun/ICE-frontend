/// <reference lib="webworker" />

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
const queue: Array<{
  file: File;
  offset: number;
  length: number;
  priority: number;
}> = [];
let processingCount = 0;
let currentSearchId: number | null = null;
let cancelSearch = false;

// WASM 관련 변수
let wasmReady = false;
let wasmSearchFunc: ((
  data: Uint8Array,
  pattern: Uint8Array,
  options?: { ignoreCase?: boolean; maxResults?: number }
) => { indices?: number[] }) | null = null;
let wasmExifFunc: ((data: Uint8Array) => any) | null = null;

// Worker 내부에서 WASM 초기화
async function initWasm() {
  if (wasmReady) {
    self.postMessage({ type: 'WASM_READY' });
    return;
  }

  try {
    self.importScripts('/js/wasm_exec.js');

    if (typeof (self as any).Go !== 'function') {
      throw new Error('Go class not found after loading wasm_exec.js');
    }

    const go = new (self as any).Go();
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
        setTimeout(() => reject(new Error('WASM 초기화 타임아웃')), 5000)
      ),
    ]);

    wasmSearchFunc = (self as any).searchFunc;
    wasmExifFunc = (self as any).exifFunc;

    if (!wasmSearchFunc || !wasmExifFunc) {
      throw new Error('WASM 함수가 등록되지 않았습니다');
    }

    wasmReady = true;
    console.log('[Worker] ✅ WASM loaded successfully');
    self.postMessage({ type: 'WASM_READY' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Worker] ❌ WASM load failed:', errorMessage);
    wasmReady = false;
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

self.addEventListener('message', (e) => {
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
      break;

    case 'RELOAD_WASM':
      wasmReady = false;
      initWasm();
      break;

    case 'SEARCH_HEX':
    case 'SEARCH_ASCII':
      cancelSearch = false;
      currentSearchId = searchId;
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
  // WASM 준비 대기 (최대 3초)
  const startTime = Date.now();
  while (!wasmReady && Date.now() - startTime < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!wasmReady || !wasmExifFunc) {
    self.postMessage({
      type: 'EXIF_ERROR',
      error: 'WASM not ready',
    });
    return;
  }

  try {
    const result = wasmExifFunc(imageData);
    self.postMessage({
      type: 'EXIF_RESULT',
      result,
    });
  } catch (error) {
    self.postMessage({
      type: 'EXIF_ERROR',
      error: (error as Error).message,
    });
  }
}

// Boyer-Moore-Horspool 검색 로직 (Fallback)
function findPatternIndicesBMH(
  array: Uint8Array,
  pattern: Uint8Array,
  ignoreCase: boolean = false,
  maxCount: number = 1000
): number[] {
  const results: number[] = [];
  const m = pattern.length;
  const n = array.length;
  if (m === 0 || n === 0 || m > n) return results;

  // Build bad character shift table
  const shift = new Array(256).fill(m);
  for (let i = 0; i < m - 1; i++) {
    let b = pattern[i];
    if (ignoreCase && b >= 0x41 && b <= 0x5a) b += 0x20;
    shift[b] = m - 1 - i;
  }

  let i = 0;
  while (i <= n - m) {
    let j = m - 1;
    while (j >= 0) {
      let a = array[i + j];
      let b = pattern[j];
      if (ignoreCase) {
        if (a >= 0x41 && a <= 0x5a) a += 0x20;
        if (b >= 0x41 && b <= 0x5a) b += 0x20;
      }
      if (a !== b) break;
      j--;
    }
    if (j < 0) {
      results.push(i);
      if (results.length >= maxCount) break;
      i += m;
    } else {
      let skip = shift[array[i + m - 1]];
      if (ignoreCase && array[i + m - 1] >= 0x41 && array[i + m - 1] <= 0x5a)
        skip = shift[array[i + m - 1] + 0x20];
      i += skip > 0 ? skip : 1;
    }
  }
  return results;
}

// WASM 기반 검색 (청크 단위)
async function searchInFile(
  file: File,
  pattern: Uint8Array,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false,
  searchId?: number
) {
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB
  const OVERLAP = pattern.length - 1;
  const fileSize = file.size;
  const results: { index: number; offset: number }[] = [];
  const foundIndices = new Set<number>();
  
  let offset = 0;
  let totalFound = 0;
  const maxResults = 1000;

  // WASM 준비 대기 (최대 2초)
  const startTime = Date.now();
  while (!wasmReady && Date.now() - startTime < 2000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const useWasm = wasmReady && wasmSearchFunc !== null;
  console.log(`[Worker] Search using ${useWasm ? 'WASM' : 'JS'}`);

  while (offset < fileSize && totalFound < maxResults) {
    if (cancelSearch) {
      console.log('[Worker] Search cancelled');
      return;
    }

    // 청크 읽기 (오버랩 포함)
    const effectiveOffset = Math.max(0, offset - OVERLAP);
    const length = Math.min(CHUNK_SIZE + OVERLAP, fileSize - effectiveOffset);
    
    try {
      const blob = file.slice(effectiveOffset, effectiveOffset + length);
      const arrayBuffer = await blob.arrayBuffer();
      const chunk = new Uint8Array(arrayBuffer);

      let chunkResults: number[] = [];

      // WASM 또는 JS로 검색
      if (useWasm) {
        try {
          const result = wasmSearchFunc!(chunk, pattern, {
            ignoreCase: type === 'ASCII' ? ignoreCase : false,
            maxResults: maxResults - totalFound,
          });
          chunkResults = result.indices || [];
        } catch (error) {
          console.error('[Worker] WASM search error, fallback to JS:', error);
          chunkResults = findPatternIndicesBMH(chunk, pattern, type === 'ASCII' ? ignoreCase : false, maxResults - totalFound);
        }
      } else {
        chunkResults = findPatternIndicesBMH(chunk, pattern, type === 'ASCII' ? ignoreCase : false, maxResults - totalFound);
      }

      // 결과를 절대 오프셋으로 변환 및 중복 제거
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
    } catch (error) {
      console.error('[Worker] Search chunk error:', error);
      break;
    }
  }

  if (!cancelSearch || searchId === currentSearchId) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results,
      searchId,
      usedWasm: useWasm,
    });
  }
}

import type {} from 'worker_threads';
