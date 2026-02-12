/**
 * Worker 공통 유틸 함수들
 */

/**
 * WorkerStats 생성 헬퍼 함수 - 중복 코드 최소화
 */
export function createStats(
  id: string,
  duration: number,
  bytesRead: number,
  totalBytes: number,
  fileName: string,
  progress?: number,
  eta?: number
) {
  const speedMBps = bytesRead ? bytesRead / 1024 / 1024 / (duration / 1000) : 0;
  return {
    id,
    ...(progress !== undefined && { progress }),
    ...(eta !== undefined && { eta }),
    speed: speedMBps, // ✅ 숫자값만
    durationMs: duration,
    durationSec: duration / 1000,
    processedBytes: bytesRead,
    totalBytes,
    fileName,
  };
}

/**
 * 파일 크기에 따른 동적 진행률 보고 간격 계산
 * - analysis.worker: bytes 단위만 필요
 * - hash.worker: bytes + ms 단위 필요
 */
export function calculateProgressInterval(fileSize: number): {
  bytes: number;
  ms: number;
} {
  if (fileSize < 100 * 1024 * 1024) {
    // 100MB 미만: 1% 또는 500ms마다
    return {
      bytes: Math.max(1024 * 1024, Math.floor(fileSize * 0.01)),
      ms: 500,
    };
  } else if (fileSize < 1024 * 1024 * 1024) {
    // 100MB ~ 1GB: 2% 또는 1000ms마다
    return {
      bytes: Math.floor(fileSize * 0.02),
      ms: 1000,
    };
  } else {
    // 1GB 이상: 5% 또는 2000ms마다
    return {
      bytes: Math.floor(fileSize * 0.05),
      ms: 2000,
    };
  }
}
