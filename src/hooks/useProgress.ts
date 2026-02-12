import { useEffect, useState, useRef } from 'react';
import eventBus from '@/types/eventBus';
import { WorkerStats } from '@/types/worker/index.worker.types';

export interface ProgressState {
  progress: number;
  speed: number;
  eta: number;
}

/**
 * eventBus의 전체 진행률을 구독하는 훅
 * RAF로 업데이트를 묶어 리렌더링 최소화
 * progress와 eta는 여기서 계산
 */
export const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const progressRef = useRef(0);
  const speedRef = useRef(0);
  const etaRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleProgress = (data: WorkerStats) => {
      // progress와 eta 계산
      const total = data.totalBytes ?? 0;
      const processed = data.processedBytes ?? 0;
      progressRef.current =
        total > 0 ? Math.round((processed / total) * 100) : 0;
      speedRef.current = data.speed ?? 0;
      etaRef.current =
        speedRef.current > 0
          ? Math.round((total - processed) / (1024 * 1024) / speedRef.current)
          : 0;

      // RAF로 업데이트 묶기 (리렌더링 최소화)
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          setProgress(progressRef.current);
          setSpeed(speedRef.current);
          setEta(etaRef.current);
          rafIdRef.current = null;
        });
      }
    };

    eventBus.on('progress', handleProgress);
    return () => {
      eventBus.off('progress', handleProgress);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return { progress, speed, eta };
};

export default useProgress;
