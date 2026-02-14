import { useEffect, useState, useRef } from 'react';
import eventBus from '@/types/eventBus';
import { WorkerStats } from '@/types/worker/index.worker.types';

export interface ProgressState {
  progress: number;
  speed: number;
  eta: number;
}

/**
 * 해시와 검색 작업의 진행률을 통합하여 보여주는 훅
 * 각 채널(hash_progress, analysis_progress)의 데이터를 합산
 * RAF로 업데이트를 묶어 리렌더링 최소화
 */
export const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);

  // 해시와 검색의 진행률을 따로 보관
  const statsRef = useRef({
    hash: null as WorkerStats | null,
    analysis: null as WorkerStats | null,
  });

  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 두 작업을 합산하여 최종 진행률 계산
    const updateUnifiedProgress = () => {
      const { hash, analysis } = statsRef.current;
      let totalBytes = 0;
      let processedBytes = 0;
      let totalSpeed = 0;

      if (hash) {
        totalBytes += hash.totalBytes ?? 0;
        processedBytes += hash.processedBytes ?? 0;
        totalSpeed += hash.speed ?? 0;
      }
      if (analysis) {
        totalBytes += analysis.totalBytes ?? 0;
        processedBytes += analysis.processedBytes ?? 0;
        totalSpeed += analysis.speed ?? 0;
      }

      const currentProgress =
        totalBytes > 0 ? Math.round((processedBytes / totalBytes) * 100) : 0;
      const currentEta =
        totalSpeed > 0
          ? Math.round(
              (totalBytes - processedBytes) / (1024 * 1024) / totalSpeed
            )
          : 0;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          'total:',
          totalBytes,
          'processed:',
          processedBytes,
          'progress:',
          currentProgress,
          'speed:',
          totalSpeed,
          'eta:',
          currentEta
        );
      }

      // RAF로 업데이트 묶기 (리렌더링 최소화)
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          setProgress(currentProgress);
          setSpeed(totalSpeed);
          setEta(currentEta);
          rafIdRef.current = null;
        });
      }
    };

    // 각각의 채널 수신 시 방을 업데이트하고 재계산 (null이면 비움)
    const handleHashProgress = (data: WorkerStats | null) => {
      statsRef.current.hash = data;
      updateUnifiedProgress();
    };

    const handleAnalysisProgress = (data: WorkerStats | null) => {
      statsRef.current.analysis = data;
      updateUnifiedProgress();
    };

    eventBus.on('hashProgress', handleHashProgress);
    eventBus.on('analysisProgress', handleAnalysisProgress);

    return () => {
      eventBus.off('hashProgress', handleHashProgress);
      eventBus.off('analysisProgress', handleAnalysisProgress);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return { progress, speed, eta };
};

export default useProgress;
