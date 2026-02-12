import { ExifResult, SearchResult } from '@/types/worker/analysis.worker.types';
import { HashResult } from '@/types/worker/hash.worker.types';
import { WorkerStats } from '@/types/worker/index.worker.types';
import { isImageMimeType } from '@/utils/thumbnail';
import mitt, { Emitter } from 'mitt';

// ============================================================================
// 이벤트 타입
// ============================================================================
export type WorkerEvents<T = HashResult | SearchResult | ExifResult> = {
  PROGRESS: WorkerStats;
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
      file?: File; // HEIC/HEIF 썸네일 생성용
    }
  >();

  public events: Emitter<WorkerEvents<T>>;
  private startProcessing?: () => void;
  private stopProcessing?: () => void;

  constructor(
    worker: Worker,
    callbacks?: {
      startProcessing?: () => void;
      stopProcessing?: () => void;
    }
  ) {
    this.worker = worker;
    this.events = mitt<WorkerEvents<T>>();
    this.startProcessing = callbacks?.startProcessing;
    this.stopProcessing = callbacks?.stopProcessing;
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
          this.events.emit('PROGRESS', {
            id: stats?.id ?? '',
            speed: stats?.speed ?? 0,
            durationMs: stats?.durationMs ?? 0,
            durationSec: stats?.durationSec ?? 0,
            processedBytes: stats?.processedBytes ?? 0,
            totalBytes: stats?.totalBytes ?? 0,
            fileName: stats?.fileName ?? '',
          } as WorkerStats);
          break;

        case 'HASH_RESULT':
          const hashReq = this.pendingRequests.get(id);
          if (!hashReq) {
            // Request not found (timed out), ignore result
            break;
          }
          hashReq.resolve({ data, stats } as any);
          this.pendingRequests.delete(id);
          this.events.emit('DONE', {
            type: 'HASH_RESULT',
            result: { data, stats } as any,
          });
          break;

        case 'SEARCH_RESULT_HEX':
        case 'SEARCH_RESULT_ASCII':
          const searchReq = this.pendingRequests.get(id);
          if (!searchReq) {
            // Request not found (timed out), ignore result
            break;
          }
          searchReq.resolve({ data, stats } as any);
          this.pendingRequests.delete(id);
          this.events.emit('DONE', {
            type,
            result: { data, stats } as any,
          });
          break;

        case 'EXIF_RESULT':
          const exifReq = this.pendingRequests.get(id);
          if (!exifReq) {
            // Request not found (timed out), ignore result
            break;
          }

          // 🎨 썸네일 처리 (이미지 타입만 메인 스레드에서 생성)
          if (
            data?.exifInfo &&
            !data.exifInfo.thumbnail &&
            data.mimeType &&
            isImageMimeType(data.mimeType) &&
            exifReq.file
          ) {
            // 동적 import로 썸네일 생성 함수 로드
            import('@/utils/thumbnail')
              .then(({ generateThumbnailInMainThread }) =>
                generateThumbnailInMainThread(exifReq.file!, data.mimeType)
              )
              .then((generatedThumbnail) => {
                if (generatedThumbnail) {
                  data.exifInfo.thumbnail = generatedThumbnail;
                }
                exifReq.resolve({ data, stats } as any);
                this.pendingRequests.delete(id);
                this.events.emit('DONE', {
                  type,
                  result: { data, stats } as any,
                });
              })
              .catch((err) => {
                console.error(
                  '[WorkerManager] Thumbnail generation failed:',
                  err
                );
                // 썸네일 생성 실패해도 EXIF 결과는 반환
                exifReq.resolve({ data, stats } as any);
                this.pendingRequests.delete(id);
                this.events.emit('DONE', {
                  type,
                  result: { data, stats } as any,
                });
              });
          } else {
            // 썸네일 생성이 필요 없는 경우
            exifReq.resolve({ data, stats } as any);
            this.pendingRequests.delete(id);
            this.events.emit('DONE', {
              type,
              result: { data, stats } as any,
            });
          }
          break;

        case 'HASH_ERROR':
        case 'SEARCH_ERROR':
        case 'EXIF_ERROR':
        case 'ERROR':
          const errReq = this.pendingRequests.get(id);
          if (errReq) {
            const errorMessage = errorCode || error || 'Unknown error';

            // ✅ 글로벌 ERROR 이벤트 발행 (WorkerContext가 구독)
            this.events.emit('ERROR', {
              code: errorCode || 'WORKER_LOGIC_ERROR',
              message: errorMessage,
            });

            // ✅ Promise reject (컴포넌트 로딩 상태 해제용)
            errReq.reject(new Error(errorMessage));
            this.pendingRequests.delete(id);
          }
          break;
      }
    };

    // ✅ worker.onerror: 워커 스크립트 로딩/초기화 에러 처리
    // HASH_ERROR, SEARCH_ERROR 등의 로직상 에러는 메시지로 옴
    // 하지만 워커 파일이 404이거나 문법 에러가 있으면, self.addEventListener가 실행되기 전에
    // 워커가 뻗어버리므로 메시지가 오지 않고 worker.onerror만 발생함
    this.worker.onerror = (event: ErrorEvent) => {
      console.error('[WorkerManager] Critical Worker Error:', event.message);

      // 대기 중인 모든 요청을 에러 처리
      this.pendingRequests.forEach((req) => {
        req.reject(new Error(`WORKER_CRITICAL_ERROR: ${event.message}`));
      });
      this.pendingRequests.clear();
      this.stopProcessing?.();

      // 컴포넌트에 에러 전파
      this.events.emit('ERROR', {
        code: 'WORKER_CRITICAL_ERROR',
        message: event.message,
      });
    };
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

    // 프로세스 시작
    this.startProcessing?.();

    // 타입별 타임아웃 설정 (ms)
    const timeoutMap: Record<string, number> = {
      PROCESS_HASH: 1, // 5분
      SEARCH_HEX: 1, // 5분
      SEARCH_ASCII: 1, // 5분
      PROCESS_EXIF: 1, // 30초
    };

    // 타입별 타임아웃 토스트 코드 매핑
    const timeoutCodeMap: Record<string, string> = {
      PROCESS_HASH: 'HASH_TIMEOUT',
      PROCESS_EXIF: 'EXIF_PROCESSING_TIMEOUT',
      SEARCH_HEX: 'SEARCH_TIMEOUT',
      SEARCH_ASCII: 'SEARCH_TIMEOUT',
    };

    const timeoutMs = timeoutMap[type] ?? 60000; // 기본값 1분
    const timeoutCode = timeoutCodeMap[type] ?? 'TIMEOUT';

    return new Promise((resolve, reject) => {
      // ✅ 타임아웃 설정 (워커에 취소 신호 전송 + 에러 반환)
      const timeoutId = setTimeout(() => {
        // 1️⃣ 워커에게 취소 신호 전송 (soft cancel)
        this.worker.postMessage({ type: 'CANCEL', id });

        // 2️⃣ 주요 리소스 정리
        this.pendingRequests.delete(id);
        this.stopProcessing?.();

        // 3️⃣ 글로벌 ERROR 이벤트 발행 (WorkerContext가 구독)
        this.events.emit('ERROR', {
          code: timeoutCode,
          message: `Task timeout: ${timeoutCode}`,
        });

        // 4️⃣ Promise reject (컴포넌트 로딩 상태 해제용)
        reject(new Error(timeoutCode));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timeoutId);
          this.stopProcessing?.();
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          this.stopProcessing?.();
          reject(error);
        },
        // PROCESS_EXIF인 경우 file 저장 (HEIC/HEIF 썸네일 생성용)
        file: type === 'PROCESS_EXIF' ? payload.file : undefined,
      });
      this.worker.postMessage({ type, id, ...payload });
    });
  }

  public terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
    this.events.all.clear();
  }
}
