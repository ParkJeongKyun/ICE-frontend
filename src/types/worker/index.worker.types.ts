/**
 * 모든 워커에서 공통으로 사용하는 타입들
 */

/**
 * 워커 응답의 통합 stats 구조
 * 모든 Progress/Result에서 동일한 형태로 사용
 */
export interface WorkerStats {
  id: string; // 요청의 고유 ID (WorkerManager에서 생성한 랜덤 UUID)
  durationMs: number; // 처리 시간 (밀리초)
  durationSec: number; // 처리 시간 (초)
  processedBytes: number; // 처리된 바이트
  totalBytes: number; // 전체 파일 바이트
  fileName: string; // 파일명
  speed: number; // ✅ 처리 속도 (MB/s) - 숫자값만, 포매팅은 UI에서 처리
}

/**
 * 워커 진행률 stats
 * PROGRESS 메시지에서 사용되는 stats 타입
 */
export interface ProgressStats extends WorkerStats {
  progress: number;
  eta: number;
}

/**
 * 워커 진행률 페이로드
 * Progress 이벤트에서 사용되는 통합 타입
 */
export interface ProgressPayload {
  id: string;
  progress: number;
  speed: string;
  eta: number;
  processedBytes: number;
  totalBytes: number;
  fileName: string;
}
