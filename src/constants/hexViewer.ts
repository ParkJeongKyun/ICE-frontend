/**
 * HexViewer 관련 상수
 */

// 청크 크기 (256KB)
export const CHUNK_SIZE = 256 * 1024;

// EXIF 읽기 크기 (256KB)
export const EXIF_READ_SIZE = 256 * 1024;

// 복사 최대 크기 (256KB)
export const MAX_COPY_SIZE = 256 * 1024;

// 청크 복사 크기 (100KB)
export const COPY_CHUNK_SIZE = 100000;

// Worker 동시 처리 제한
export const MAX_CONCURRENT_WORKERS = 5;

// 렌더링 간격 (ms)
export const RENDER_INTERVAL = 150;

// 업데이트 간격 (ms)
export const UPDATE_INTERVAL = 50;

// Debounce 시간 (ms)
export const CHUNK_REQUEST_DEBOUNCE = 50;
