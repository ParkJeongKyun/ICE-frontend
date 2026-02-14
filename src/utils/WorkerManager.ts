import {
  WorkerStats,
  TaskMap,
  StandardWorkerResponse,
  ExecuteResponse,
} from '@/types/worker/index.worker.types';
import { isImageMimeType } from '@/utils/thumbnail';
import mitt, { Emitter } from 'mitt';

export type WorkerEvents = {
  PROGRESS: WorkerStats;
  DONE: {
    type: keyof TaskMap;
    result: TaskMap[keyof TaskMap]['res'];
    stats?: WorkerStats;
  };
  WASM_READY: void;
  ERROR: { code: string };
};

// UUID v4 랜덤 생성 유틸
function generateUUID(): string {
  return crypto.randomUUID();
}

export class WorkerManager {
  private worker!: Worker;
  private workerFactory: () => Worker; // 워커 생성 함수(레시피) 보관
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: ExecuteResponse<unknown>) => void;
      reject: (reason: Error) => void;
      taskType: keyof TaskMap;
      file?: File; // HEIC/HEIF 썸네일 생성용
    }
  >();

  public events: Emitter<WorkerEvents>;
  private startProcessing?: () => void;
  private stopProcessing?: () => void;

  // 기존 worker: Worker 대신 workerFactory 함수를 받습니다.
  constructor(
    workerFactory: () => Worker,
    callbacks?: {
      startProcessing?: () => void;
      stopProcessing?: () => void;
    }
  ) {
    this.workerFactory = workerFactory;
    this.events = mitt<WorkerEvents>();
    this.startProcessing = callbacks?.startProcessing;
    this.stopProcessing = callbacks?.stopProcessing;

    // 초기 워커 생성
    this.initWorker();
  }

  // 워커 초기화 및 리스너 부착
  private initWorker() {
    this.worker = this.workerFactory();
    this.setupListener();
  }

  // 워커 부활 프로세스 (기존 워커 죽이고 새로 생성)
  private respawnWorker() {
    console.warn('[WorkerManager] Respawning worker...');
    this.worker.terminate();
    this.initWorker(); // 새 워커 생성 후 리스너 다시 연결!
  }

  private setupListener() {
    // 1️⃣ 메시지 수신 리스너
    this.worker.onmessage = (e: MessageEvent<StandardWorkerResponse>) => {
      const { status, taskType, data, stats, errorCode, id } = e.data;
      const targetId = id ?? stats?.id ?? '';

      switch (status) {
        case 'WASM_READY':
          this.events.emit('WASM_READY');
          break;

        case 'PROGRESS':
          // 모든 워커의 진행률이 여기로 통합됨
          if (stats) {
            this.events.emit('PROGRESS', stats);
          }
          break;

        case 'SUCCESS':
          // 모든 워커의 성공 결과가 여기로 통합됨
          const req = this.pendingRequests.get(targetId);
          if (!req) break; // Request not found (timed out), ignore result

          // EXIF 썸네일 처리는 taskType으로 구분 (isProcessing 유지를 위해 매니저에서 수행)
          if (
            req.taskType === 'PROCESS_EXIF' &&
            data &&
            typeof data === 'object' &&
            'mimeType' in data &&
            isImageMimeType(data.mimeType as string)
          ) {
            this.handleThumbnail(targetId, req, data, stats);
          } else {
            this.resolveRequest(targetId, req, data, stats);
          }
          break;

        case 'ERROR':
          // 모든 워커의 에러가 여기로 통합됨
          const errReq = this.pendingRequests.get(targetId);
          if (errReq) {
            this.events.emit('ERROR', { code: errorCode || 'WORKER_ERROR' });
            errReq.reject(new Error(errorCode || 'Unknown error'));
            if (targetId) this.pendingRequests.delete(targetId); // undefined 검사
            this.stopProcessing?.();
          }
          break;
      }
    };

    // 2️⃣ 치명적 에러 리스너 (onmessage 바깥에 위치)
    // worker.onerror: 워커 스크립트 로딩/초기화 에러 처리
    // HASH_ERROR, SEARCH_ERROR 등의 로직상 에러는 메시지로 옴
    // 하지만 워커 파일이 404이거나 문법 에러가 있으면, self.addEventListener가 실행되기 전에
    // 워커가 뻗어버리므로 메시지가 오지 않고 worker.onerror만 발생함
    this.worker.onerror = (event: ErrorEvent) => {
      console.error('[WorkerManager] Critical Worker Error:', event.message);

      // 대기 중인 모든 요청을 에러 처리
      this.pendingRequests.forEach((req) => {
        req.reject(new Error(`WORKER_ERROR: ${event.message}`));
      });
      this.pendingRequests.clear();
      this.stopProcessing?.();

      // 컴포넌트에 에러 전파
      this.events.emit('ERROR', {
        code: 'WORKER_ERROR',
      });
    };
  }

  /**
   * 헬퍼: 요청을 즉시 resolve 처리
   */
  private resolveRequest(
    id: string,
    req: {
      resolve: (value: ExecuteResponse<unknown>) => void;
      taskType: keyof TaskMap;
    },
    data: unknown,
    stats?: WorkerStats
  ) {
    req.resolve({ data, stats });
    this.events.emit('DONE', {
      type: req.taskType,
      result: data as TaskMap[keyof TaskMap]['res'],
      stats,
    });
    this.pendingRequests.delete(id);
    this.stopProcessing?.();
  }

  /**
   * 헬퍼: EXIF 썸네일 생성 후 resolve 처리
   */
  private handleThumbnail(
    id: string,
    req: {
      resolve: (value: ExecuteResponse<unknown>) => void;
      taskType: keyof TaskMap;
      file?: File;
    },
    data: unknown,
    stats?: WorkerStats
  ) {
    // 타입 가드를 통해 안전하게 속성 접근
    if (
      typeof data === 'object' &&
      data !== null &&
      'exifInfo' in data &&
      'mimeType' in data
    ) {
      const typedData = data as Record<string, any>;
      // 썸네일 처리 (이미지 타입만 메인 스레드에서 생성)
      if (typedData.exifInfo && !typedData.exifInfo.thumbnail && req.file) {
        // 동적 import로 썸네일 생성 함수 로드
        import('@/utils/thumbnail')
          .then(({ generateThumbnailInMainThread }) =>
            generateThumbnailInMainThread(req.file!, typedData.mimeType)
          )
          .then((generatedThumbnail) => {
            if (generatedThumbnail) {
              typedData.exifInfo.thumbnail = generatedThumbnail;
            }
            this.resolveRequest(id, req, typedData, stats);
          })
          .catch((err) => {
            console.error('[WorkerManager] Thumbnail generation failed:', err);
            // 썸네일 생성 실패해도 EXIF 결과는 반환
            this.resolveRequest(id, req, data, stats);
          });
      } else {
        // 썸네일 생성이 필요 없는 경우
        this.resolveRequest(id, req, data, stats);
      }
    } else {
      // data가 예상 형식이 아니면 그냥 반환
      this.resolveRequest(id, req, data, stats);
    }
  }

  // 파일 크기 기반 동적 타임아웃 계산
  // 공식: Timeout = Base Time + (File Size (MB) / Min Speed (MB/s)) × Safety Factor
  // (최대값: 20분)
  private calculateDynamicTimeout(
    taskType: string,
    fileSizeBytes?: number
  ): number {
    // 파열 크기가 없으면 기본값 사용
    if (!fileSizeBytes || fileSizeBytes <= 0) {
      return 30000; // 기본 대기 시간: 30초
    }

    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // 작업 타입별 기본값
    // Base Time: 워커 초기화 및 메시지 왕복 비용
    // Min Speed: 저사양 기기에서도 나올 법한 최소 속도
    const config: Record<string, { baseTime: number; minSpeed: number }> = {
      PROCESS_HASH: {
        baseTime: 30000, // 30초
        minSpeed: 5, // MB/s (SHA256)
      },
      PROCESS_EXIF: {
        baseTime: 30000, // 30초
        minSpeed: 10, // MB/s (메모리 I/O)
      },
      SEARCH_HEX: {
        baseTime: 30000, // 30초
        minSpeed: 10, // MB/s (WASM)
      },
      SEARCH_ASCII: {
        baseTime: 30000, // 30초
        minSpeed: 10, // MB/s (WASM)
      },
    };

    const { baseTime, minSpeed } = config[taskType] ?? {
      baseTime: 30000,
      minSpeed: 10,
    };

    // 안전 계수: 2배 (예상치 못한 렉이나 백그라운드 작업 고려)
    const SAFETY_FACTOR = 2;
    // 최대 제한: 20분
    const MAX_TIMEOUT = 20 * 60 * 1000; // 1200000ms

    const calculatedTimeout =
      baseTime + (fileSizeMB / minSpeed) * SAFETY_FACTOR * 1000;

    // 최대값으로 제한
    const finalTimeout = Math.min(calculatedTimeout, MAX_TIMEOUT);

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[WorkerManager] Task: ${taskType}, File: ${fileSizeMB.toFixed(2)}MB, Timeout: ${(finalTimeout / 1000).toFixed(1)}s`
      );
    }

    return Math.round(finalTimeout);
  }

  // 최종 응늵 타입은 ExecuteResponse<TaskMap[K]['res']>
  public async execute<K extends keyof TaskMap>(
    type: K,
    payload: TaskMap[K]['req']
  ): Promise<ExecuteResponse<TaskMap[K]['res']>> {
    const id = generateUUID();

    // 프로세스 시작
    this.startProcessing?.();

    // 타입별 타임아웃 토스트 코드 매핑
    const timeoutCodeMap: Record<string, string> = {
      PROCESS_HASH: 'HASH_TIMEOUT',
      PROCESS_EXIF: 'EXIF_TIMEOUT',
      SEARCH_HEX: 'SEARCH_TIMEOUT',
      SEARCH_ASCII: 'SEARCH_TIMEOUT',
    };

    const timeoutCode = timeoutCodeMap[type] ?? 'TIMEOUT';

    // 📏 파일 크기 기반 동적 타임아웃 계산
    const fileSizeBytes = payload.file?.size; // File 객체 또는 undefined
    const timeoutMs = this.calculateDynamicTimeout(type, fileSizeBytes);

    return new Promise((resolve, reject) => {
      // 타임아웃 설정 (워커에 취소 신호 전송 + 에러 반환)
      const timeoutId = setTimeout(() => {
        // [수정됨] 해시든 분석이든 타임아웃 걸리면 무조건 하드 종료 후 부활!
        this.respawnWorker();

        // 주요 리소스 정리
        this.pendingRequests.delete(id);
        this.stopProcessing?.();

        // 글로벌 ERROR 이벤트 발행 (WorkerContext가 구독하여 진행률 UI 비움)
        this.events.emit('ERROR', {
          code: timeoutCode,
        });

        // Promise reject (컴포넌트 로딩 상태 해제용)
        reject(new Error(timeoutCode));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timeoutId);
          this.stopProcessing?.();
          resolve(value as ExecuteResponse<TaskMap[K]['res']>);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          this.stopProcessing?.();
          reject(error);
        },
        taskType: type,
        // PROCESS_EXIF인 경우 file 저장 (HEIC/HEIF 썸네일 생성용)
        file:
          'file' in payload && payload.file instanceof File
            ? payload.file
            : undefined,
      });
      this.worker.postMessage({ type, id, ...payload });
    });
  }

  /**
   * 현재 진행 중인 작업을 즉시 강제 취소(하드 종료)합니다.
   */
  public cancel(): void {
    if (this.pendingRequests.size === 0) return;

    // 1. UI 대기열 에러 처리
    this.pendingRequests.forEach((req) => {
      req.reject(new Error('USER_CANCELLED'));
    });
    this.respawnWorker();
    this.pendingRequests.clear();
    this.stopProcessing?.();
    this.events.emit('ERROR', { code: 'USER_CANCELLED' });
  }

  public terminate() {
    // 대기 중인 모든 요청을 에러 처리
    this.pendingRequests.forEach((req) => {
      req.reject(new Error('WORKER_TERMINATED'));
    });

    // 워커 종료 및 정리
    this.worker.terminate();
    this.pendingRequests.clear();
    this.events.all.clear();
    this.stopProcessing?.();
  }
}
