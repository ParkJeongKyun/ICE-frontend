// 동시 처리 제한 (5개까지 동시 처리 - 3에서 증가)
const MAX_CONCURRENT = 5;
const queue: Array<{ file: File; offset: number; length: number }> = [];
let processingCount = 0;

async function processQueue() {
  while (processingCount < MAX_CONCURRENT && queue.length > 0) {
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
  const { type, file, offset, length } = e.data;

  if (type === 'READ_CHUNK') {
    queue.push({ file, offset, length });
    processQueue();
  }
});
