/// <reference lib="webworker" />
import {
  AnalysisWorkerRequest,
  SearchOptions,
  WasmExifFunction,
  WasmSearchFunction,
} from '@/types/worker/analysis.worker.types';
import { createStats, calculateProgressInterval } from './utils';
import { parseExifDataInWorker } from '@/workers/utils/exifParser';

declare const self: DedicatedWorkerGlobalScope;

// 📊 [최적화된 로깅] 배열 대신 '단순 숫자 변수'만 사용
// 객체 생성(Allocation)이 없으므로 GC 부하가 0에 가깝습니다.
let totalReadCount = 0;
let totalReadBytes = 0;

// ✅ 진행률 추적 변수
let currentFileSize = 0;
let currentFileName = '';
let currentRequestId: string | undefined;
let lastProgressReportBytes = 0;
let progressReportInterval = 4 * 1024 * 1024; // 동적으로 계산됨

// ✅ FileReaderSync를 사용한 동기 파일 읽기
const syncReader = new FileReaderSync();

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

    // ✅ 진행률 전송 (동적 간격마다)
    if (currentFileSize > 0 && currentRequestId !== undefined) {
      const bytesProcessed = totalReadBytes - lastProgressReportBytes;
      if (bytesProcessed >= progressReportInterval) {
        const duration = performance.now();
        const progress = Math.min(
          100,
          Math.round((totalReadBytes / currentFileSize) * 100)
        );
        const speed = totalReadBytes / 1024 / 1024 / (duration / 1000);
        const eta =
          totalReadBytes < currentFileSize
            ? Math.round(
                (currentFileSize - totalReadBytes) / 1024 / 1024 / speed
              )
            : 0;

        self.postMessage({
          type: 'SEARCH_PROGRESS',
          stats: createStats(
            currentRequestId,
            duration,
            totalReadBytes,
            currentFileSize,
            currentFileName,
            progress,
            eta
          ),
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

// ✅ 동시 처리 제한 (요청 ID 기반)
let cancelledRequestIds = new Set<string>();

// 요청별 진행률 추적 초기화
function initProgress(
  fileSize: number,
  requestId: string,
  fileName: string = ''
) {
  totalReadCount = 0;
  totalReadBytes = 0;
  lastProgressReportBytes = 0;
  currentFileSize = fileSize;
  currentFileName = fileName;
  currentRequestId = requestId;
  progressReportInterval = calculateProgressInterval(fileSize).bytes;
}

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

    const go = new ((self as any).Go as typeof Go)();
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
      go.importObject as any
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
      throw new Error('WASM functions not registered');
    }

    wasmReady = true;
    wasmInitializing = false;

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

self.addEventListener('message', (e: MessageEvent<AnalysisWorkerRequest>) => {
  const { type, id, file, pattern, ignoreCase } = e.data;

  switch (type) {
    case 'CANCEL_SEARCH':
      cancelledRequestIds.add(id);
      break;

    case 'RELOAD_WASM':
      if (!wasmInitializing) {
        wasmReady = false;
        initWasm();
      }
      break;

    case 'SEARCH_HEX':
    case 'SEARCH_ASCII':
      // 이전 요청 취소 정보는 새 요청 시 유지 (필요시 명시적으로 cancel 호출)
      if (file && pattern) {
        searchInFile(
          id,
          file,
          pattern,
          type === 'SEARCH_HEX' ? 'HEX' : 'ASCII',
          ignoreCase
        );
      }
      break;

    case 'PROCESS_EXIF':
      if (file) {
        processExif(id, file);
      }
      break;
  }
});

async function processExif(id: string, file: File) {
  try {
    // ✅ 진행률 추적 초기화
    initProgress(file.size, id);

    // ✅ WASM 준비 대기 로직
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

    const perfStart = performance.now();

    // --- WASM 실행 (EXIF 추출) ---
    const wasmResult = wasmExifFunc(file);
    // -------------------------

    const perfEnd = performance.now();
    const duration = perfEnd - perfStart;

    if (wasmResult.error) {
      self.postMessage({
        type: 'EXIF_ERROR',
        stats: { id },
        errorCode: 'EXIF_PARSE_ERROR',
        error: wasmResult.error,
      });
      return;
    }

    // 📝 EXIF 데이터 파싱 (워커 유틸 사용)
    const exifInfo = await parseExifDataInWorker(
      wasmResult.exifData || '[]',
      file,
      wasmResult.mimeType || '',
      syncReader
    );

    self.postMessage({
      type: 'EXIF_RESULT',
      stats: createStats(
        id,
        duration,
        totalReadBytes,
        currentFileSize,
        file.name
      ),
      data: {
        hasExif: wasmResult.hasExif || false,
        mimeType: wasmResult.mimeType,
        extension: wasmResult.extension,
        exifInfo,
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'EXIF_ERROR',
      id,
      errorCode: 'EXIF_ERROR',
      error: (error as Error).message,
    });
  }
}

// WASM 기반 검색 (스트리밍)
async function searchInFile(
  id: string,
  file: File,
  pattern: string,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false
) {
  // ✅ 진행률 추적 초기화
  initProgress(file.size, id, file.name);

  // pattern을 Uint8Array로 변환
  const patternBytes = new TextEncoder().encode(pattern);

  // ✅ WASM 준비 대기 로직 통일
  const startTime = Date.now();
  const timeout = 3000;

  while (!wasmReady && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!wasmReady || !wasmSearchFunc) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      id,
      indices: null,
      stats: {
        id,
        durationMs: 0,
        durationSec: 0,
        processedBytes: 0,
        totalBytes: 0,
        fileName: currentFileName,
      },
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
    const result = wasmSearchFunc(file, patternBytes, searchOptions);
    // -------------------------

    // 📊 [측정 종료] 차이값 계산
    const perfEnd = performance.now();
    const duration = perfEnd - perfStart;
    const bytesRead = totalReadBytes - startBytes;

    if (result.error) {
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        id,
        indices: null,
        stats: {
          id,
          durationMs: duration,
          durationSec: duration / 1000,
          processedBytes: bytesRead,
          totalBytes: currentFileSize,
          fileName: file.name,
        },
        errorCode: 'SEARCH_WASM_ERROR',
        error: result.error,
      });
      return;
    }

    const results = (result.indices || []).map((idx: number) => ({
      index: idx,
      offset: pattern.length,
    }));

    if (!cancelledRequestIds.has(id)) {
      self.postMessage({
        type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
        stats: createStats(id, duration, bytesRead, currentFileSize, file.name),
        data: {
          indices: results,
        },
      });
    }
  } catch (error) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      stats: {
        id,
      },
      errorCode: 'SEARCH_ERROR',
      error: (error as Error).message || 'Search failed',
    });
  }
}
