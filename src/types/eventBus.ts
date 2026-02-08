import mitt from 'mitt';
import { WorkerStats } from './worker/index.worker.types';

export type ToastEvent = {
  code: string;
  message?: string;
  stats?: WorkerStats;
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
};

const eventBus = mitt<Events>();
export default eventBus;
