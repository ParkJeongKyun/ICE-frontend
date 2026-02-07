import mitt from 'mitt';

export type ToastEvent = {
  code: string;
  customMessage?: string;
};

export type ProgressEvent = {
  progress: number;
  speed?: string;
  eta?: number;
  processedBytes?: number;
};

export type Events = {
  toast: ToastEvent;
  progress: ProgressEvent;
  // 필요시 다른 이벤트 추가
};

const eventBus = mitt<Events>();
export default eventBus;
