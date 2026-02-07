import mitt, { Emitter } from 'mitt';

// 워커와 주고받을 이벤트 타입 정의
export type WorkerEvents = {
  // 진행률 이벤트 (구독용)
  PROGRESS: {
    id: number;
    progress: number;
    speed: string;
    eta: number;
    processedBytes: number;
  };
  // WASM 로딩 상태
  WASM_READY: void;
  // 에러
  ERROR: { code: string; message: string };
};

export class WorkerManager {
  private worker: Worker;
  private pendingRequests = new Map<
    number,
    { resolve: Function; reject: Function }
  >();
  private sequence = 0;

  // 외부에서 progress 등을 구독할 수 있는 Emitter
  public events: Emitter<WorkerEvents>;

  constructor(worker: Worker) {
    this.worker = worker;
    this.events = mitt<WorkerEvents>();
    this.setupListener();
  }

  private setupListener() {
    this.worker.onmessage = (e) => {
      const {
        type,
        id,
        result,
        error,
        progress,
        speed,
        eta,
        processedBytes,
        hash,
        errorCode,
      } = e.data;

      switch (type) {
        case 'WASM_READY':
          this.events.emit('WASM_READY');
          break;

        case 'HASH_PROGRESS':
        case 'SEARCH_PROGRESS':
          // 진행률은 Promise 해결이 아니라 '이벤트 방송'으로 처리
          this.events.emit('PROGRESS', {
            id,
            progress,
            speed,
            eta,
            processedBytes,
          });
          break;

        case 'HASH_RESULT':
          // result 필드를 resolve
          const hashReq =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (hashReq) {
            hashReq.resolve(result);
            if (id) this.pendingRequests.delete(id);
          }
          break;

        case 'SEARCH_RESULT_HEX':
        case 'SEARCH_RESULT_ASCII':
        case 'EXIF_RESULT':
          const req =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (req) {
            req.resolve(result);
            if (id) this.pendingRequests.delete(id);
          }
          break;

        case 'HASH_ERROR':
        case 'SEARCH_ERROR':
        case 'EXIF_ERROR':
        case 'ERROR':
          const errReq =
            this.pendingRequests.get(id) || this.getFirstPendingRequest();
          if (errReq) {
            errReq.reject(new Error(error || errorCode));
            if (id) this.pendingRequests.delete(id);
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

  // ✅ 사용자가 호출할 메서드: Promise를 반환하여 await 가능하게 함
  public execute(type: string, payload: any): Promise<any> {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      // payload에 id와 type을 섞어서 전송
      this.worker.postMessage({ type, id, ...payload });
    });
  }

  public terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
    this.events.all.clear();
  }
}
