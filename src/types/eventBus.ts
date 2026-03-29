import mitt from 'mitt';
import { WorkerStats } from './worker/index.worker.types';

export type ToastEvent = {
  code: string;
  message?: string;
  stats?: WorkerStats;
};

export type HexSelectionPreviewEvent = {
  start: number | null;
  end: number | null;
  cursor: number | null;
};

export type Events = {
  toast: ToastEvent;
  hashProgress: WorkerStats | null; // 해시 전용 채널 (null: 비움)
  analysisProgress: WorkerStats | null; // 검색 전용 채널 (null: 비움)
  hexSelectionPreview: HexSelectionPreviewEvent;
  hexSelectionUpdate: HexSelectionPreviewEvent;
  hexSelectionEnd: undefined;
};

const eventBus = mitt<Events>();
export default eventBus;
