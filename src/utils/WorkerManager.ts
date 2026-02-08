import { ExifResult, SearchResult } from '@/types/worker/analysis.worker.types';
import { HashResult } from '@/types/worker/hash.worker.types';
import { ProgressPayload } from '@/types/worker/index.worker.types';
import mitt, { Emitter } from 'mitt';

// ============================================================================
// 이벤트 타입
// ============================================================================
export type WorkerEvents<T = HashResult | SearchResult | ExifResult> = {
  PROGRESS: ProgressPayload;
  DONE: {
    type: string;
    result: T;
  };
  WASM_READY: void;
  ERROR: { code: string; message: string };
};

// UUID v4 랜덤 생성 유틸
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class WorkerManager<
  T extends HashResult | SearchResult | ExifResult =
    | HashResult
    | SearchResult
    | ExifResult,
> {
  private worker: Worker;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: T) => void;
      reject: (reason: Error) => void;
    }
  >();

  public events: Emitter<WorkerEvents<T>>;

  constructor(worker: Worker) {
    this.worker = worker;
    this.events = mitt<WorkerEvents<T>>();
    this.setupListener();
  }

  private setupListener() {
    this.worker.onmessage = (
      e: MessageEvent<{
        type: string;
        data?: any;
        result?: HashResult | SearchResult | ExifResult;
        error?: string;
        stats?: any;
        errorCode?: string;
      }>
    ) => {
      const { type, result, data, error, stats, errorCode } = e.data;
      // ✅ ID는 stats에서만 추출
      const id = stats?.id;

      switch (type) {
        case 'WASM_READY':
          this.events.emit('WASM_READY');
          break;

        case 'HASH_PROGRESS':
        case 'SEARCH_PROGRESS':
          // ✅ stats에서만 id 추출
          const statsId = stats?.id;
          this.events.emit('PROGRESS', {
            id: statsId,
            progress: stats?.progress ?? 0,
            speed:
              typeof stats?.speed === 'number'
                ? `${stats.speed.toFixed(2)} MB/s`
                : (stats?.speed ?? ''),
            eta: stats?.eta ?? 0,
            processedBytes: stats?.processedBytes ?? 0,
            totalBytes: stats?.totalBytes ?? 0,
            fileName: stats?.fileName ?? '',
          } as ProgressPayload);
          break;

        case 'HASH_RESULT':
          const hashReq =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (hashReq) {
            hashReq.resolve({ data, stats } as any);
            this.pendingRequests.delete(id);
          }
          this.events.emit('DONE', {
            type: 'HASH_RESULT',
            result: { data, stats } as any,
          });
          break;

        case 'SEARCH_RESULT_HEX':
        case 'SEARCH_RESULT_ASCII':
        case 'EXIF_RESULT':
          const req =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (req) {
            req.resolve({ data, stats } as any);
            this.pendingRequests.delete(id);
          }
          this.events.emit('DONE', {
            type,
            result: { data, stats } as any,
          });
          break;

        case 'HASH_ERROR':
        case 'SEARCH_ERROR':
        case 'EXIF_ERROR':
        case 'ERROR':
          const errReq =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (errReq) {
            errReq.reject(new Error(error || errorCode));
            this.pendingRequests.delete(id);
          } else {
            // 요청 ID가 없는 전역 에러는 이벤트로 전파
            this.events.emit('ERROR', {
              code: errorCode || 'WORKER_ERROR',
              message: error || errorCode || 'Unknown error',
            });
          }
          break;
      }
    };

    this.worker.onerror = (event) => {
      this.events.emit('ERROR', {
        code: 'WORKER_RUNTIME_ERROR',
        message: event.message,
      });
    };
  }

  // 첫 번째 대기 중인 요청을 반환하는 헬퍼
  private getFirstPendingRequest() {
    for (const [, req] of this.pendingRequests) {
      return req;
    }
    return null;
  }

  // Overload signatures for type inference
  public execute(
    type: 'PROCESS_HASH',
    payload: Record<string, any>
  ): Promise<HashResult>;
  public execute(
    type: 'PROCESS_EXIF',
    payload: Record<string, any>
  ): Promise<ExifResult>;
  public execute(
    type: 'SEARCH_HEX' | 'SEARCH_ASCII',
    payload: Record<string, any>
  ): Promise<SearchResult>;

  // Implementation
  public execute(
    type: string,
    payload: Record<string, any>
  ): Promise<HashResult | SearchResult | ExifResult> {
    const id = generateUUID();
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ type, id, ...payload });
    });
  }

  public terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
    this.events.all.clear();
  }
}
