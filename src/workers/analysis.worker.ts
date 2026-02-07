/// <reference lib="webworker" />

import type {
  WorkerMessage,
  SearchOptions,
  WasmSearchFunction,
  WasmExifFunction,
} from '../types/fileReader.worker';

declare const self: DedicatedWorkerGlobalScope;

// ✅ FileReaderSync를 사용한 동기 파일 읽기
const syncReader = new FileReaderSync();

// 📊 [최적화된 로깅] 배열 대신 '단순 숫자 변수'만 사용
// 객체 생성(Allocation)이 없으므로 GC 부하가 0에 가깝습니다.
let totalReadCount = 0;
let totalReadBytes = 0;

// ✅ 진행률 추적 변수
let currentFileSize = 0;
let currentRequestId: number | undefined;
let currentSearchRequestId: number | undefined; // user-provided searchId (search request identifier)
let lastProgressReportBytes = 0;
const PROGRESS_REPORT_INTERVAL = 4 * 1024 * 1024; // 4MB마다 진행률 전송

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

    // ✅ 진행률 전송 (일정 간격마다)
    if (currentFileSize > 0 && currentRequestId !== undefined) {
      const bytesProcessed = totalReadBytes - lastProgressReportBytes;
      if (bytesProcessed >= PROGRESS_REPORT_INTERVAL) {
        const progress = Math.min(
          100,
          Math.round((totalReadBytes / currentFileSize) * 100)
        );
        const duration = performance.now() / 1000; // 대략적인 경과 시간
        const speed = (totalReadBytes / 1024 / 1024 / duration).toFixed(2);
        const eta =
          totalReadBytes < currentFileSize
            ? Math.round(
                (currentFileSize - totalReadBytes) /
                  1024 /
                  1024 /
                  parseFloat(speed)
              )
            : 0;

        self.postMessage({
          type: 'SEARCH_PROGRESS',
          id: currentRequestId,
          searchId: currentSearchRequestId,
          progress,
          speed: `${speed} MB/s`,
          eta,
          processedBytes: totalReadBytes,
        });

        lastProgressReportBytes = totalReadBytes;
      }
    }

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

// ✅ 동시 처리 제한
const MAX_CONCURRENT = 8;
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

    // 함수 가져오기
    wasmSearchFunc = (self as any).searchFunc;
    wasmExifFunc = (self as any).exifFunc;

    if (!wasmSearchFunc || !wasmExifFunc) {
      // 함수가 없으면 전역 스코프의 모든 함수를 나열
      const allFuncs = Object.entries(self as any)
        .filter(([k, v]) => typeof v === 'function')
        .map(([k]) => k);
      console.error('[Worker] Available functions:', allFuncs);
      throw new Error('WASM functions not registered');
    }

    wasmReady = true;
    wasmInitializing = false;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Worker] WASM initialization completed successfully');
    }

    self.postMessage({ type: 'WASM_READY' });
  } catch (error) {
    wasmReady = false;
    wasmInitializing = false;
    console.error('[Worker] WASM initialization error:', error);
    self.postMessage({
      type: 'WASM_ERROR',
      errorCode: 'WASM_INIT_FAILED',
      error: (error as Error).message,
    });
  }
}

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const {
    type,
    id, // ✅ WorkerManager에서 보내는 id를 받음
    file,
    offset,
    length,
    priority = offset,
    pattern,
    ignoreCase,
    searchId,
    hashId,
  } = e.data;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Worker] Message received:', type, {
      id,
      hasFile: !!file,
      fileSize: (file as any)?.size,
    });
  }

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
        id, // ✅ WorkerManager의 id 전달
        file,
        pattern,
        type === 'SEARCH_HEX' ? 'HEX' : 'ASCII',
        ignoreCase,
        searchId
      );
      break;

    case 'PROCESS_EXIF':
      processExif(id, file);
      break;
  }
});
async function processExif(id: number, file: File) {
  // ✅ 진행률 추적 초기화
  currentFileSize = file.size;
  currentRequestId = id;
  lastProgressReportBytes = 0;
  totalReadBytes = 0;
  totalReadCount = 0;

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
        id, // ✅ id 포함
        errorCode: 'EXIF_PARSE_ERROR',
        error: result.error,
      });
    } else {
      self.postMessage({
        type: 'EXIF_RESULT',
        id, // ✅ id 포함
        result,
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'EXIF_ERROR',
      id, // ✅ id 포함
      errorCode: 'EXIF_ERROR',
      error: (error as Error).message,
    });
  }
}

// WASM 기반 검색 (스트리밍)
async function searchInFile(
  id: number,
  file: File,
  pattern: Uint8Array,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false,
  searchId?: number
) {
  // ✅ 진행률 추적 초기화
  currentFileSize = file.size;
  currentRequestId = id;
  currentSearchRequestId = searchId;
  lastProgressReportBytes = 0;
  totalReadBytes = 0;
  totalReadCount = 0;

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
      if (process.env.NODE_ENV === 'development') {
        console.log('[SEARCH] Sending result:', {
          type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
          id,
          resultsLength: results.length,
          searchId,
        });
      }
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        id, // ✅ WorkerManager의 id를 응답에 포함
        result: { indices: results },
        searchId,
        usedWasm: true,
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SEARCH] Search cancelled, not sending result');
      }
    }
  } catch (error) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      id, // ✅ WorkerManager의 id를 에러 응답에도 포함
      results: null,
      searchId,
      errorCode: 'SEARCH_ERROR',
      error: (error as Error).message || 'Search failed',
    });
  }
}

import type {} from 'worker_threads';
