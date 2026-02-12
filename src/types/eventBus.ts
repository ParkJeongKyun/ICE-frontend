import mitt from 'mitt';
import { WorkerStats } from './worker/index.worker.types';

export type ToastEvent = {
  code: string;
  message?: string;
  stats?: WorkerStats;
};

export type Events = {
  toast: ToastEvent;
  progress: WorkerStats;
};

const eventBus = mitt<Events>();
export default eventBus;
