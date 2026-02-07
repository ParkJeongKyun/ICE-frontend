import { useEffect, useState } from 'react';
import type { WorkerManager } from '@/utils/WorkerManager';

export interface ProgressState {
  progress: number;
  speed: string;
  eta: number;
  processedBytes?: number;
}

export const useProgress = (manager: WorkerManager | null) => {
  const [state, setState] = useState<ProgressState>({
    progress: 0,
    speed: '0',
    eta: 0,
  });

  useEffect(() => {
    if (!manager) return;
    const handler = (data: any) => {
      setState({
        progress: data.progress ?? 0,
        speed: data.speed ?? '0',
        eta: data.eta ?? 0,
        processedBytes: data.processedBytes,
      });
    };

    manager.events.on('PROGRESS', handler);
    return () => manager.events.off('PROGRESS', handler);
  }, [manager]);

  return state;
};

export default useProgress;
