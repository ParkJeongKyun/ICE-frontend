import mitt from 'mitt';

export type ToastEvent = {
  code: string;
  customMessage?: string;
};

export type Events = {
  toast: ToastEvent;
  // 필요시 다른 이벤트 추가
};

const eventBus = mitt<Events>();
export default eventBus;
