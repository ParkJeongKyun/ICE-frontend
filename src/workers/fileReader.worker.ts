/// <reference lib="webworker" />

import type {
  WorkerMessage,
  ChunkTask,
  SearchOptions,
  WasmSearchFunction,
  WasmExifFunction,
} from '../types/fileReader.worker';
import { createSHA256 } from 'hash-wasm';

declare const self: DedicatedWorkerGlobalScope;

// ✅ FileReaderSync를 사용한 동기 파일 읽기
const syncReader = new FileReaderSync();

// 📊 [최적화된 로깅] 배열 대신 '단순 숫자 변수'만 사용
// 객체 생성(Allocation)이 없으므로 GC 부하가 0에 가깝습니다.
let totalReadCount = 0;
let totalReadBytes = 0;

/**
 * Go WASM에서 호출할 전역 동기 함수
 * WASM의 Read 요청 시 호출되어 필요한 조각만 반환합니다.
 * @param file - JavaScript File 객체
 * @param offset - 읽을 시작 위치
 * @param length - 읽을 바이트 수
 * @returns 요청한 범위의 Uint8Array, 오류 시 null
 */
(self as any).readBlockSync = (
  file: File,
  offset: number,
  length: number
): Uint8Array | null => {
  try {
    // 📊 성능 저하 없는 초경량 로깅 (단순 덧셈)
    totalReadCount++;
    totalReadBytes += length;

    // 필요한 부분만 잘라내어 메모리 효율 극대화
    const blob = file.slice(offset, offset + length);
    // 동기식으로 읽어 즉시 반환 (WASM의 동기적 Read와 일치)
    const buffer = syncReader.readAsArrayBuffer(blob);
    return new Uint8Array(buffer);
  } catch (e) {
    console.error('[Worker] readBlockSync error:', e);
    return null;
  }
};

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
    hashId,
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
      processExif(file);
      break;

    case 'PROCESS_HASH':
      if (file && file instanceof File) {
        processHash(file, hashId);
      } else {
        self.postMessage({
          type: 'HASH_ERROR',
          errorCode: 'INVALID_FILE',
          error: 'File object is invalid or undefined',
          hashId,
        });
      }
      break;
  }
});

// EXIF 처리 함수
async function processExif(file: File) {
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
    // 📊 [측정 시작] 현재 카운터 상태 저장
    const startCount = totalReadCount;
    const startBytes = totalReadBytes;
    const perfStart = performance.now();

    // --- WASM 실행 (핵심 작업) ---
    const result = wasmExifFunc(file);
    // -------------------------

    // 📊 [측정 종료] 차이값 계산
    const perfEnd = performance.now();
    const duration = perfEnd - perfStart;
    const requestCount = totalReadCount - startCount;
    const bytesRead = totalReadBytes - startBytes;

    // 📝 [최종 리포트] 작업이 끝난 후 딱 한 번만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[EXIF Parse] File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      );
      console.log(`- Time: ${(duration / 1000).toFixed(3)}s`);
      console.log(
        `- Speed: ${(bytesRead / 1024 / 1024 / (duration / 1000)).toFixed(2)} MB/s`
      );
      console.log(`- Read Calls: ${requestCount}`);
      console.log(
        `- Avg Chunk: ${(bytesRead / (requestCount || 1) / 1024).toFixed(2)} KB`
      );
    }

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

// WASM 기반 검색 (스트리밍)
async function searchInFile(
  file: File,
  pattern: Uint8Array,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false,
  searchId?: number
) {
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

  try {
    // 📊 [측정 시작] 현재 카운터 상태 저장
    const startCount = totalReadCount;
    const startBytes = totalReadBytes;
    const perfStart = performance.now();

    // ✅ File 객체와 pattern을 직접 전달
    // Go에서 readBlockSync를 통해 필요한 데이터만 pull 방식으로 읽음
    const searchOptions: SearchOptions = {
      ignoreCase: type === 'ASCII' ? ignoreCase : false,
      maxResults: 1000,
    };

    // --- WASM 실행 (핵심 작업) ---
    const result = wasmSearchFunc(file, pattern, searchOptions);
    // -------------------------

    // 📊 [측정 종료] 차이값 계산
    const perfEnd = performance.now();
    const duration = perfEnd - perfStart;
    const requestCount = totalReadCount - startCount;
    const bytesRead = totalReadBytes - startBytes;

    // 📝 [최종 리포트] 작업이 끝난 후 딱 한 번만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[SEARCH ${type}] File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) | Pattern: ${pattern.length} bytes`
      );
      console.log(`- Time: ${(duration / 1000).toFixed(3)}s`);
      if (bytesRead > 0) {
        console.log(
          `- Speed: ${(bytesRead / 1024 / 1024 / (duration / 1000)).toFixed(2)} MB/s`
        );
      }
      console.log(`- Read Calls: ${requestCount}`);
      if (requestCount > 0) {
        console.log(
          `- Avg Chunk: ${(bytesRead / requestCount / 1024).toFixed(2)} KB`
        );
      }
    }

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

    const results = (result.indices || []).map((idx: number) => ({
      index: idx,
      offset: pattern.length,
    }));

    if (searchId === undefined || !cancelledSearchIds.has(searchId)) {
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        results,
        searchId,
        usedWasm: true,
      });
    }
  } catch (error) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results: null,
      searchId,
      errorCode: 'SEARCH_ERROR',
      error: (error as Error).message || 'Search failed',
    });
  }
}

// ✅ [최종 최적화] Streams API를 사용한 물리적 한계 속도 해시 계산
async function processHash(file: File, hashId?: number) {
  try {
    const startTime = performance.now();

    // 1. WASM 해셔 생성
    const hasher = await createSHA256();
    hasher.init();

    // ✅ [핵심 변경] FileReaderSync 대신 Streams API 사용
    // 브라우저 엔진에게 "네가 가장 효율적인 방식으로 빨대를 꽂아줘"라고 요청하는 방식입니다.
    const stream = file.stream();
    const reader = stream.getReader();

    let totalRead = 0;

    while (true) {
      // 브라우저가 알아서 적절한 크기(보통 64KB ~ 1MB)로 읽어옵니다.
      // 64MB씩 강제로 읽는 것보다 GC 부하가 훨씬 적습니다.
      const { done, value } = await reader.read();

      if (done) break;

      // value는 Uint8Array입니다. 바로 주입합니다.
      hasher.update(value);

      // 진행률 계산
      totalRead += value.length;
      // (선택) 진행률 보고 로직 추가...
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

    self.postMessage({ type: 'HASH_RESULT', hash: hashHex, hashId });
  } catch (error) {
    self.postMessage({
      type: 'HASH_ERROR',
      error: (error as Error).message,
      hashId,
    });
  }
}

import type {} from 'worker_threads';
