// ✅ 동시 처리 제한 증가 및 우선순위 큐 추가
const MAX_CONCURRENT = 8; // 5 → 8로 증가
const queue: Array<{
  file: File;
  offset: number;
  length: number;
  priority: number; // 우선순위 추가
}> = [];
let processingCount = 0;
let currentSearchId: number | null = null;
let cancelSearch = false;

async function processQueue() {
  while (processingCount < MAX_CONCURRENT && queue.length > 0) {
    // ✅ 우선순위 정렬 (낮은 offset = 높은 우선순위)
    queue.sort((a, b) => a.priority - b.priority);

    processingCount++;
    const task = queue.shift()!;

    try {
      const blob = task.file.slice(task.offset, task.offset + task.length);
      const arrayBuffer = await blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      self.postMessage({
        type: 'CHUNK_DATA',
        offset: task.offset,
        data,
      });
    } catch (error: any) {
      self.postMessage({
        type: 'ERROR',
        error: error.message,
        offset: task.offset,
      });
    } finally {
      processingCount--;
      processQueue();
    }
  }
}

self.addEventListener('message', (e) => {
  const {
    type,
    file,
    offset,
    length,
    priority = offset,
    pattern,
    ignoreCase,
    searchId,
  } = e.data;

  if (type === 'CANCEL_SEARCH') {
    cancelSearch = true;
    return;
  }

  if (type === 'SEARCH_HEX' || type === 'SEARCH_ASCII') {
    // 새로운 검색 시작 시 이전 검색 중단
    cancelSearch = false;
    currentSearchId = searchId;
    searchInFile(
      file,
      pattern,
      type === 'SEARCH_HEX' ? 'HEX' : 'ASCII',
      ignoreCase,
      searchId
    );
  }

  if (type === 'READ_CHUNK') {
    queue.push({ file, offset, length, priority });
    processQueue();
  }
});

// Boyer-Moore-Horspool 검색 로직
function findPatternIndicesBMH(
  array: Uint8Array,
  pattern: Uint8Array,
  ignoreCase: boolean = false,
  maxCount: number = 1000
): number[] {
  const results: number[] = [];
  const m = pattern.length;
  const n = array.length;
  if (m === 0 || n === 0 || m > n) return results;

  // Build bad character shift table
  const shift = new Array(256).fill(m);
  for (let i = 0; i < m - 1; i++) {
    let b = pattern[i];
    if (ignoreCase && b >= 0x41 && b <= 0x5a) b += 0x20;
    shift[b] = m - 1 - i;
  }

  let i = 0;
  while (i <= n - m) {
    let j = m - 1;
    while (j >= 0) {
      let a = array[i + j];
      let b = pattern[j];
      if (ignoreCase) {
        if (a >= 0x41 && a <= 0x5a) a += 0x20;
        if (b >= 0x41 && b <= 0x5a) b += 0x20;
      }
      if (a !== b) break;
      j--;
    }
    if (j < 0) {
      results.push(i);
      if (results.length >= maxCount) break;
      i += m;
    } else {
      let skip = shift[array[i + m - 1]];
      if (ignoreCase && array[i + m - 1] >= 0x41 && array[i + m - 1] <= 0x5a)
        skip = shift[array[i + m - 1] + 0x20];
      i += skip > 0 ? skip : 1;
    }
  }
  return results;
}

// 검색 요청 처리
async function searchInFile(
  file: File,
  pattern: Uint8Array,
  type: 'HEX' | 'ASCII',
  ignoreCase: boolean = false,
  searchId?: number
) {
  const CHUNK_SIZE = 1024 * 1024; // 1MB
  const fileSize = file.size;
  const results: { index: number; offset: number }[] = [];
  let offset = 0;
  let totalFound = 0;
  while (offset < fileSize) {
    // 검색 중 취소 요청이 오면 즉시 중단
    if (cancelSearch) return;
    const length = Math.min(CHUNK_SIZE, fileSize - offset);
    const blob = file.slice(offset, offset + length);
    const arrayBuffer = await blob.arrayBuffer();
    const chunk = new Uint8Array(arrayBuffer);

    // 기존 KMP 대신 Boyer-Moore-Horspool 사용
    const foundIndices = findPatternIndicesBMH(
      chunk,
      pattern,
      type === 'ASCII' ? ignoreCase : false,
      1000 - totalFound // limit total results
    );
    for (const idx of foundIndices) {
      results.push({ index: offset + idx, offset: pattern.length });
      totalFound++;
      if (totalFound >= 1000) break;
    }
    if (totalFound >= 1000) break;
    offset += CHUNK_SIZE;
  }
  if (!cancelSearch || searchId === currentSearchId) {
    self.postMessage({
      type: type === 'HEX' ? 'SEARCH_RESULT_HEX' : 'SEARCH_RESULT_ASCII',
      results,
      searchId,
    });
  }
}

// 타입스크립트에서만 모듈로 인식되도록 타입 전용 import 추가
import type {} from 'worker_threads';
