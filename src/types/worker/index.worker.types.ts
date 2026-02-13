/**
 * 모든 워커에서 공통으로 사용하는 타입들
 */

import type { HashResult, HashType } from './hash.worker.types';
import type { SearchResult, ExifResult } from './analysis.worker.types';

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

// ============================================================================
// 1단계: 공통 타입 규격(Contract) 정의
// ============================================================================

/**
 * TaskMap: 어떤 요청(req)을 보내면 어떤 결과(res)가 오는지 매핑
 * 새로운 워커 기능 추가 시: 여기에 타입 한 줄만 추가하면 됩니다
 */
export type TaskMap = {
  PROCESS_HASH: {
    req: { file: File; hashType?: HashType };
    res: HashResult['data'];
  };
  PROCESS_EXIF: {
    req: { file: File };
    res: ExifResult['data'];
  };
  SEARCH_HEX: {
    req: { file: File; pattern: Uint8Array }; // 🚀 Uint8Array로 변경
    res: SearchResult['data'];
  };
  SEARCH_ASCII: {
    req: { file: File; pattern: Uint8Array; ignoreCase?: boolean }; // 🚀 Uint8Array로 변경
    res: SearchResult['data'];
  };
};

/**
 * 워커 -> 매니저: 워커가 매니저에게 보내는 표준 메시지
 * 🚀 id를 루트 레벨로 이동하여 에러 시에도 안전하게 추적 가능
 */
export interface StandardWorkerResponse<T = unknown> {
  id?: string; // 🚀 루트 레벨로 이동! (WASM_READY 등 id가 없는 경우를 위해 optional)
  status: 'SUCCESS' | 'PROGRESS' | 'ERROR' | 'WASM_READY'; // 상태 통일
  taskType?: keyof TaskMap; // 'PROCESS_HASH' 등
  data?: T; // 실제 결과물
  stats?: WorkerStats; // 통계(진행률 등)
  errorCode?: string;
}

/**
 * 매니저 -> 컴포넌트: execute() 호출 시 컴포넌트가 받는 최종 응답값
 */
export interface ExecuteResponse<T> {
  data: T; // 실제 결과물 (자동 완성 지원)
  stats?: WorkerStats; // 에러나 특수 상황 대비 optional
}
