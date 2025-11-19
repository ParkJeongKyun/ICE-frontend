// ✅ 동시 처리 제한 증가 및 우선순위 큐 추가
const MAX_CONCURRENT = 8; // 5 → 8로 증가
const queue: Array<{
  file: File;
  offset: number;
  length: number;
  priority: number; // 우선순위 추가
}> = [];
let processingCount = 0;

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
  const { type, file, offset, length, priority = offset } = e.data;

  if (type === 'READ_CHUNK') {
    queue.push({ file, offset, length, priority });
    processQueue();
  }
});
