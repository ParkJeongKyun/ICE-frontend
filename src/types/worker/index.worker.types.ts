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
