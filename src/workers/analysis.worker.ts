/// <reference lib="webworker" />
import {
  AnalysisWorkerRequest,
  SearchOptions,
  WasmDetectTypeFunction,
  WasmExifFunction,
  WasmPeFunction,
  WasmSearchFunction,
  WasmTextChunkFunction,
} from '@/types/worker/analysis.worker.types';
import { createStats, calculateProgressInterval } from './utils';
import { fetchWasmWithCache } from './utils/wasmLoader';
import { parseExifDataInWorker } from '@/workers/utils/exifParser';
import { WASM_MANIFEST } from '@/constants/wasm';

declare const self: DedicatedWorkerGlobalScope;

/**
 * 분석 가능한 파일 카테고리 정의
 */
const FILE_CATEGORY = {
  IMAGE: 'image',
  PE: 'pe',
  UNKNOWN: 'unknown',
} as const;

type FileCategory = (typeof FILE_CATEGORY)[keyof typeof FILE_CATEGORY];

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
  private coreReady = false;
  private coreInitializing = false;
  private imageEngineReady = false;
  private imageEngineInitializing = false;
  private peEngineReady = false;
  private peEngineInitializing = false;

  private wasmSearchFunc: WasmSearchFunction | null = null;
  private wasmDetectTypeFunc: WasmDetectTypeFunction | null = null;
  private wasmExifFunc: WasmExifFunction | null = null;
  private wasmTextChunkFunc: WasmTextChunkFunction | null = null;
  private wasmPeFunc: WasmPeFunction | null = null;

  private coreGoInstance: Go | null = null;
  private imageGoInstance: Go | null = null;
  private peGoInstance: Go | null = null;

  private wasmPath = WASM_MANIFEST.core;

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
    const requestId = this.currentRequestId;
    if (requestId === undefined) return;

    const duration = performance.now();

    self.postMessage({
      status: 'PROGRESS',
      taskType: 'SEARCH_HEX', // or SEARCH_ASCII (taskType은 호출자가 구분하지만, 진행률에서는 크게 중요하지 않음)
      stats: createStats(
        requestId,
        duration,
        this.totalReadBytes,
        this.currentFileSize,
        this.currentFileName
      ),
    });
  }

  /**
   * 특정 전역 함수가 등록될 때까지 대기 (WASM 초기화 확인용)
   */
  private async waitForFunctions(
    fnNames: string[],
    timeoutMs: number = 10000
  ): Promise<void> {
    const start = Date.now();
    while (fnNames.some((name) => typeof (self as any)[name] !== 'function')) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(
          `TIMEOUT: WASM functions not registered: ${fnNames.join(', ')}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * WASM 초기화 (Core)
   */
  async initCoreWasm(): Promise<void> {
    if (this.coreReady || this.coreInitializing) return;
    this.coreInitializing = true;

    try {
      self.importScripts('/js/wasm_exec.js');
      if (typeof (self as any).Go !== 'function') {
        throw new Error('Go class not found');
      }

      const go = new ((self as any).Go as typeof Go)();
      this.coreGoInstance = go;

      const response = await fetchWasmWithCache(this.wasmPath);
      const result = await WebAssembly.instantiateStreaming(
        Promise.resolve(response),
        go.importObject
      );

      go.run(result.instance).catch((err) =>
        console.error('[Worker] Core go.run error:', err)
      );

      await this.waitForFunctions(['searchFunc', 'detectTypeFunc']);

      this.wasmSearchFunc = (self as any).searchFunc;
      this.wasmDetectTypeFunc = (self as any).detectTypeFunc;
      this.coreReady = true;
      self.postMessage({ status: 'WASM_READY' });
    } catch (error) {
      console.error('[Worker] Core WASM init error:', error);
      self.postMessage({ status: 'ERROR', errorCode: 'WASM_LOAD_FAILED' });
    } finally {
      this.coreInitializing = false;
    }
  }

  /**
   * 엔진 로드 (Image, PE 등)
   */
  async loadEngine(
    id: string,
    engineType: 'image' | 'pe',
    path: string
  ): Promise<void> {
    const isReady =
      engineType === 'image' ? this.imageEngineReady : this.peEngineReady;
    const isInitializing =
      engineType === 'image'
        ? this.imageEngineInitializing
        : this.peEngineInitializing;

    if (isReady || isInitializing) {
      if (isReady)
        self.postMessage({ id, status: 'SUCCESS', taskType: 'LOAD_ENGINE' });
      return;
    }

    if (engineType === 'image') this.imageEngineInitializing = true;
    else this.peEngineInitializing = true;

    try {
      const go = new ((self as any).Go as typeof Go)();
      const response = await fetchWasmWithCache(path);
      const result = await WebAssembly.instantiateStreaming(
        Promise.resolve(response),
        go.importObject
      );

      go.run(result.instance).catch((err) =>
        console.error(`[Worker] ${engineType} go.run error:`, err)
      );

      if (engineType === 'image') {
        await this.waitForFunctions(['exifFunc', 'textChunkFunc']);
        this.wasmExifFunc = (self as any).exifFunc;
        this.wasmTextChunkFunc = (self as any).textChunkFunc;
        this.imageEngineReady = true;
        this.imageGoInstance = go;
      } else {
        await this.waitForFunctions(['peFunc']);
        this.wasmPeFunc = (self as any).peFunc;
        this.peEngineReady = true;
        this.peGoInstance = go;
      }

      self.postMessage({ id, status: 'SUCCESS', taskType: 'LOAD_ENGINE' });
    } catch (error) {
      console.error(`[Worker] ${engineType} engine init error:`, error);
      self.postMessage({
        id,
        status: 'ERROR',
        taskType: 'LOAD_ENGINE',
        errorCode: 'ENGINE_LOAD_FAILED',
      });
    } finally {
      if (engineType === 'image') this.imageEngineInitializing = false;
      else this.peEngineInitializing = false;
    }
  }

  /**
   * 파일 타입 감지 및 카테고리 분류
   */
  private getFileInfo(
    file: File,
    options?: AnalysisWorkerRequest['options']
  ): { mimeType: string; extension: string; category: FileCategory } {
    let mimeType = options?.mimeType;
    let extension = options?.extension;

    if (!mimeType && this.wasmDetectTypeFunc) {
      const typeResult = this.wasmDetectTypeFunc!(file);
      if (typeResult.success && typeResult.data) {
        mimeType = typeResult.data.mimeType || file.type || 'application/octet-stream';
        extension = typeResult.data.extension || '';
      }
    }

    mimeType = mimeType || file.type || 'application/octet-stream';
    extension = extension || '';

    let category: FileCategory = FILE_CATEGORY.UNKNOWN;
    if (mimeType.startsWith('image/')) {
      category = FILE_CATEGORY.IMAGE;
    } else if (
      mimeType === 'application/x-msdownload' ||
      mimeType === 'application/x-executable' ||
      ['exe', 'dll', 'sys', 'ocx'].includes(extension.toLowerCase())
    ) {
      category = FILE_CATEGORY.PE;
    }

    return { mimeType, extension, category };
  }

  /**
   * JSON 파싱 헬퍼 (WASM 응답 처리용)
   */
  private parseJsonData<T>(data: any): T | undefined {
    if (!data) return undefined;
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error('[Worker] JSON parsing failed:', e);
      return undefined;
    }
  }

  /**
   * 이미지 파일 분석 로직
   */
  private async analyzeImage(
    file: File,
    mimeType: string,
    extension: string,
    options?: AnalysisWorkerRequest['options']
  ) {
    let exifInfo = undefined;
    let textChunkData = undefined;

    const imageOpts = options?.image;
    try {
      if (imageOpts?.exif !== false && this.wasmExifFunc) {
        const wasmResult = this.wasmExifFunc!(file, mimeType, extension);
        if (wasmResult && wasmResult.success && wasmResult.found) {
          exifInfo = await parseExifDataInWorker(
            wasmResult.data || '[]',
            file,
            mimeType,
            this.syncReader
          );
        }
      }

      if (
        imageOpts?.textChunk !== false &&
        this.wasmTextChunkFunc &&
        mimeType.includes('image/png')
      ) {
        const pngResponse = this.wasmTextChunkFunc!(file, mimeType, extension);
        if (pngResponse && pngResponse.success && pngResponse.found) {
          textChunkData = this.parseJsonData(pngResponse.data);
        }
      }
    } catch (e) {
      console.warn('[Worker] Image engine analysis failed:', e);
    }

    return { exifInfo, textChunkData };
  }

  /**
   * PE 파일 분석 로직
   */
  private async analyzePe(
    file: File,
    mimeType: string,
    extension: string,
    options?: AnalysisWorkerRequest['options']
  ) {
    let peData = undefined;

    try {
      const wasmResult = this.wasmPeFunc!(file, mimeType, extension);
      if (wasmResult && wasmResult.success && wasmResult.found) {
        peData = this.parseJsonData(wasmResult.data);
      }
    } catch (e) {
      console.warn('[Worker] PE engine analysis failed:', e);
    }

    return { peData };
  }

  /**
   * 파일 분석 (기본 타입 감지 + 선택적 플러그인 분석)
   */
  async processAnalysis(
    id: string,
    file: File,
    options?: AnalysisWorkerRequest['options']
  ): Promise<void> {
    try {
      this.initProgress(file.size, id);

      if (!this.coreReady || !this.wasmDetectTypeFunc) {
        throw new Error('WASM_NOT_READY');
      }

      const perfStart = performance.now();
      const { mimeType, extension, category } = this.getFileInfo(file, options);

      let analysisResult: any = {
        exifInfo: undefined,
        textChunkData: undefined,
        peData: undefined,
      };

      const engines = {
        core: true, // Core는 항상 사용됨
        image: false,
        pe: false,
      };

      // 0. 분석 기능 자체가 꺼져있으면 기본 정보만 반환
      if (options?.enabled === false) {
        const duration = performance.now() - perfStart;
        self.postMessage({
          id,
          status: 'SUCCESS',
          taskType: 'PROCESS_ANALYSIS',
          stats: createStats(
            id,
            duration,
            this.totalReadBytes,
            this.currentFileSize,
            file.name
          ),
          data: {
            mimeType,
            extension,
            ...analysisResult,
            engines,
          },
        });
        return;
      }

      // 카테고리별 분석 수행
      switch (category) {
        case FILE_CATEGORY.IMAGE:
          const imageOpts = options?.image;
          if (imageOpts?.enabled !== false && this.imageEngineReady) {
            const imageResult = await this.analyzeImage(
              file,
              mimeType,
              extension,
              options
            );
            analysisResult = { ...analysisResult, ...imageResult };
            engines.image = true;
          }
          break;

        case FILE_CATEGORY.PE:
          if (options?.pe !== false && this.peEngineReady) {
            const peResult = await this.analyzePe(
              file,
              mimeType,
              extension,
              options
            );
            analysisResult = { ...analysisResult, ...peResult };
            engines.pe = true;
          }
          break;

        default:
          // 기본 분석 외 추가 작업 없음
          break;
      }

      const duration = performance.now() - perfStart;

      self.postMessage({
        id,
        status: 'SUCCESS',
        taskType: 'PROCESS_ANALYSIS',
        stats: createStats(
          id,
          duration,
          this.totalReadBytes,
          this.currentFileSize,
          file.name
        ),
        data: {
          mimeType,
          extension,
          ...analysisResult,
          engines,
        },
      });
    } catch (error: any) {
      console.error('[Worker] processAnalysis error:', error);
      self.postMessage({
        id,
        status: 'ERROR',
        taskType: 'PROCESS_ANALYSIS',
        errorCode:
          error.message === 'WASM_NOT_READY'
            ? 'WASM_NOT_READY'
            : 'ANALYSIS_ERROR',
      });
    }
  }

  /**
   * WASM 기반 검색 (스트리밍)
   */
  async search(
    id: string,
    file: File,
    pattern: Uint8Array,
    type: 'HEX' | 'ASCII',
    ignoreCase: boolean = false
  ): Promise<void> {
    this.initProgress(file.size, id, file.name);

    if (!this.coreReady || !this.wasmSearchFunc) {
      self.postMessage({
        id,
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

      const result = this.wasmSearchFunc!(file, pattern, searchOptions);
      const duration = performance.now() - perfStart;

      if (!result.success) {
        throw new Error('SEARCH_WASM_ERROR');
      }

      let parsedIndices: number[] =
        this.parseJsonData<number[]>(result.data) || [];
      const results = parsedIndices.map((idx: number) => ({
        index: idx,
        offset: pattern.length,
      }));

      self.postMessage({
        id,
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
    } catch (error: any) {
      self.postMessage({
        id,
        status: 'ERROR',
        taskType: type === 'HEX' ? 'SEARCH_HEX' : 'SEARCH_ASCII',
        errorCode:
          error.message === 'SEARCH_WASM_ERROR'
            ? 'SEARCH_WASM_ERROR'
            : 'SEARCH_ERROR',
      });
    }
  }

  /**
   * 메시지 핸들러
   */
  async handle(data: AnalysisWorkerRequest): Promise<void> {
    const { type, id, file, pattern, ignoreCase, engineType, path, options } =
      data;

    switch (type) {
      case 'LOAD_ENGINE':
        if (engineType && path) {
          await this.loadEngine(id, engineType, path);
        }
        break;

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

      case 'PROCESS_ANALYSIS':
        if (file) {
          await this.processAnalysis(id, file, options);
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

// 워커 생성 직후 자동으로 Core WASM 초기화
analysisWorker.initCoreWasm();
