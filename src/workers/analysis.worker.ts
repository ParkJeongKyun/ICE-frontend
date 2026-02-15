/// <reference lib="webworker" />
import {
  AnalysisWorkerRequest,
  SearchOptions,
  WasmExifFunction,
  WasmSearchFunction,
  WasmTextChunkFunction,
} from '@/types/worker/analysis.worker.types';
import { createStats, calculateProgressInterval } from './utils';
import { parseExifDataInWorker } from '@/workers/utils/exifParser';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 분석 워커 클래스
 * EXIF 파싱, 패턴 검색, WASM 관리
 */
class AnalysisWorker {
  // 📊 [최적화된 로깅] 배열 대신 '단순 숫자 변수'만 사용
  private totalReadCount = 0;
  private totalReadBytes = 0;

  // ✅ 진행률 추적 변수
  private currentFileSize = 0;
  private currentFileName = '';
  private currentRequestId: string | undefined;
  private lastProgressReportBytes = 0;
  private progressReportInterval = 4 * 1024 * 1024;

  // ✅ FileReaderSync를 사용한 동기 파일 읽기
  private syncReader = new FileReaderSync();

  // WASM 관련 변수
  private wasmReady = false;
  private wasmInitializing = false;
  private wasmSearchFunc: WasmSearchFunction | null = null;
  private wasmExifFunc: WasmExifFunction | null = null;
  private wasmTextChunkFunc: WasmTextChunkFunction | null = null;
  private goInstance: Go | null = null;
  private wasmPath = process.env.NEXT_PUBLIC_WASM_PATH;

  /**
   * Go WASM에서 호출할 전역 동기 함수 설정
   */
  setupReadBlockSync(): void {
    const readBlockSync = (
      file: File,
      offset: number,
      length: number
    ): Uint8Array | null => {
      try {
        this.totalReadCount++;
        this.totalReadBytes += length;

        // ✅ 진행률 전송 (동적 간격마다)
        if (this.currentFileSize > 0 && this.currentRequestId !== undefined) {
          const bytesProcessed =
            this.totalReadBytes - this.lastProgressReportBytes;
          if (bytesProcessed >= this.progressReportInterval) {
            this.sendSearchProgress();
            this.lastProgressReportBytes = this.totalReadBytes;
          }
        }

        const blob = file.slice(offset, offset + length);
        const buffer = this.syncReader.readAsArrayBuffer(blob);
        return new Uint8Array(buffer);
      } catch (e) {
        console.error('[Worker] readBlockSync error:', e);
        return null;
      }
    };
    (
      self as DedicatedWorkerGlobalScope & {
        readBlockSync: typeof readBlockSync;
      }
    ).readBlockSync = readBlockSync;
  }

  /**
   * 진행률 초기화
   */
  private initProgress(
    fileSize: number,
    requestId: string,
    fileName: string = ''
  ): void {
    this.totalReadCount = 0;
    this.totalReadBytes = 0;
    this.lastProgressReportBytes = 0;
    this.currentFileSize = fileSize;
    this.currentFileName = fileName;
    this.currentRequestId = requestId;
    this.progressReportInterval = calculateProgressInterval(fileSize).bytes;
  }

  /**
   * 검색 진행률 전송 (StandardWorkerResponse 형식)
   */
  private sendSearchProgress(): void {
    if (this.currentRequestId === undefined) return;

    const duration = performance.now();

    self.postMessage({
      status: 'PROGRESS',
      taskType: 'SEARCH_HEX', // or SEARCH_ASCII (taskType은 호출자가 구분하지만, 진행률에서는 크게 중요하지 않음)
      stats: createStats(
        this.currentRequestId,
        duration,
        this.totalReadBytes,
        this.currentFileSize,
        this.currentFileName
      ),
    });
  }

  /**
   * WASM 초기화
   */
  async initWasm(): Promise<void> {
    if (this.wasmReady) {
      self.postMessage({ status: 'WASM_READY' });
      return;
    }

    if (this.wasmInitializing) {
      return;
    }

    this.wasmInitializing = true;

    try {
      if (this.goInstance) {
        if (this.goInstance.exit) {
          try {
            this.goInstance.exit(0);
          } catch (e) {
            // Cleanup error ignored
          }
        }
        this.goInstance = null;
      }

      this.wasmSearchFunc = null;
      this.wasmExifFunc = null;
      this.wasmReady = false;

      self.importScripts('/js/wasm_exec.js');

      if (typeof (self as any).Go !== 'function') {
        throw new Error('Go class not found after loading wasm_exec.js');
      }

      const go = new ((self as any).Go as typeof Go)();
      this.goInstance = go;

      if (!this.wasmPath) {
        throw new Error(
          'WASM_PATH_NOT_CONFIGURED: NEXT_PUBLIC_WASM_PATH environment variable is not set'
        );
      }

      const response = await fetch(this.wasmPath);
      if (!response.ok) {
        throw new Error(
          `WASM_LOAD_FAILED: Failed to load WASM from "${this.wasmPath}" (HTTP ${response.status} ${response.statusText})`
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
      const globalScope = self as DedicatedWorkerGlobalScope;
      this.wasmSearchFunc = globalScope.searchFunc;
      this.wasmExifFunc = globalScope.exifFunc;
      this.wasmTextChunkFunc = globalScope.textChunkFunc;

      if (
        !this.wasmSearchFunc ||
        !this.wasmExifFunc ||
        !this.wasmTextChunkFunc
      ) {
        throw new Error('WASM functions not registered');
      }

      this.wasmReady = true;
      this.wasmInitializing = false;

      self.postMessage({ status: 'WASM_READY' });
    } catch (error) {
      this.wasmReady = false;
      this.wasmInitializing = false;
      console.error('[Worker] WASM initialization error:', error);
      self.postMessage({
        status: 'ERROR',
        errorCode: 'WASM_LOAD_FAILED',
      });
    }
  }

  /**
   * EXIF 처리 (PNG 메타데이터 추출 포함)
   */
  async processExif(id: string, file: File): Promise<void> {
    try {
      this.initProgress(file.size, id);

      if (!this.wasmReady || !this.wasmExifFunc || !this.wasmTextChunkFunc) {
        self.postMessage({
          id, // 루트에 id 직접 삽입
          status: 'ERROR',
          taskType: 'PROCESS_EXIF',
          errorCode: 'WASM_NOT_READY',
        });
        return;
      }

      const perfStart = performance.now();

      // --- WASM 실행 (EXIF 추출) ---
      const wasmResult = this.wasmExifFunc(file);
      // -------------------------

      const perfEnd = performance.now();
      const duration = perfEnd - perfStart;

      if (wasmResult.error) {
        self.postMessage({
          id, // 루트에 id 직접 삽입
          status: 'ERROR',
          taskType: 'PROCESS_EXIF',
          errorCode: 'EXIF_PARSE_ERROR',
        });
        return;
      }

      // 📝 EXIF 데이터 파싱 (워커 유틸 사용)
      const exifInfo = await parseExifDataInWorker(
        wasmResult.exifData || '[]',
        file,
        wasmResult.mimeType || '',
        this.syncReader
      );

      // PNG 파일인 경우 추가로 PNG 메타데이터 추출
      let textChunkData = undefined;
      if (
        wasmResult.mimeType === 'image/png' ||
        wasmResult.mimeType === 'image/apng'
      ) {
        try {
          // WASM 함수가 JSON 문자열을 반환 (EXIF와 동일한 패턴)
          const pngResponse = this.wasmTextChunkFunc(file);
          if (pngResponse.hasTextChunks && pngResponse.textChunkData) {
            textChunkData = JSON.parse(pngResponse.textChunkData);
          }
        } catch (e) {
          console.warn('[Worker] PNG metadata extraction failed:', e);
        }
      }

      self.postMessage({
        status: 'SUCCESS',
        taskType: 'PROCESS_EXIF',
        stats: createStats(
          id,
          duration,
          this.totalReadBytes,
          this.currentFileSize,
          file.name
        ),
        data: {
          hasExif: wasmResult.hasExif || false,
          mimeType: wasmResult.mimeType,
          extension: wasmResult.extension,
          exifInfo,
          textChunkData,
        },
      });
    } catch (error) {
      self.postMessage({
        id, // 루트에 id 직접 삽입
        status: 'ERROR',
        taskType: 'PROCESS_EXIF',
        errorCode: 'EXIF_ERROR',
      });
    }
  }

  /**
   * WASM 기반 검색 (스트리밍)
   */
  async search(
    id: string,
    file: File,
    pattern: Uint8Array, // Uint8Array로 직접 받음
    type: 'HEX' | 'ASCII',
    ignoreCase: boolean = false
  ): Promise<void> {
    this.initProgress(file.size, id, file.name);

    if (!this.wasmReady || !this.wasmSearchFunc) {
      self.postMessage({
        id, // 루트에 id 직접 삽입
        status: 'ERROR',
        taskType: type === 'HEX' ? 'SEARCH_HEX' : 'SEARCH_ASCII',
        errorCode: 'WASM_NOT_READY',
      });
      return;
    }

    try {
      const perfStart = performance.now();

      const searchOptions: SearchOptions = {
        ignoreCase: type === 'ASCII' ? ignoreCase : false,
        maxResults: 1000,
      };

      // --- WASM 실행 (핵심 작업) ---
      const result = this.wasmSearchFunc(file, pattern, searchOptions);
      // -------------------------

      const perfEnd = performance.now();
      const duration = perfEnd - perfStart;

      if (result.error) {
        self.postMessage({
          id, // 루트에 id 직접 삽입
          status: 'ERROR',
          taskType: type === 'HEX' ? 'SEARCH_HEX' : 'SEARCH_ASCII',
          errorCode: 'SEARCH_WASM_ERROR',
        });
        return;
      }

      const results = (result.indices || []).map((idx: number) => ({
        index: idx,
        offset: pattern.length,
      }));

      self.postMessage({
        status: 'SUCCESS',
        taskType: type === 'HEX' ? 'SEARCH_HEX' : 'SEARCH_ASCII',
        stats: createStats(
          id,
          duration,
          this.totalReadBytes,
          this.currentFileSize,
          file.name
        ),
        data: {
          indices: results,
        },
      });
    } catch (error) {
      self.postMessage({
        id, // 루트에 id 직접 삽입
        status: 'ERROR',
        taskType: type === 'HEX' ? 'SEARCH_HEX' : 'SEARCH_ASCII',
        errorCode: 'SEARCH_ERROR',
      });
    }
  }

  /**
   * 메시지 핸들러
   */
  async handle(data: AnalysisWorkerRequest): Promise<void> {
    const { type, id, file, pattern, ignoreCase } = data;

    switch (type) {
      case 'SEARCH_HEX':
      case 'SEARCH_ASCII':
        if (file && pattern) {
          await this.search(
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
          await this.processExif(id, file);
        }
        break;
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
const analysisWorker = new AnalysisWorker();
analysisWorker.setupReadBlockSync();
self.addEventListener('message', (e: MessageEvent<AnalysisWorkerRequest>) => {
  analysisWorker.handle(e.data as AnalysisWorkerRequest);
});

// 워커 생성 직후 자동으로 WASM 초기화
analysisWorker.initWasm();
