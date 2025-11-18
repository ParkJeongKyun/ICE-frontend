// 동시 처리 제한 (5개까지 동시 처리 - 3에서 증가)
const MAX_CONCURRENT = 5;
const queue: Array<{ file: File; offset: number; length: number }> = [];
let processingCount = 0;

async function processQueue() {
  while (processingCount < MAX_CONCURRENT && queue.length > 0) {
    processingCount++;
    const { file, offset, length } = queue.shift()!;
    
    try {
      const blob = file.slice(offset, offset + length);
      const arrayBuffer = await blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      self.postMessage({
        type: 'CHUNK_DATA',
        offset,
        data,
      });
    } catch (error: any) {
      self.postMessage({
        type: 'ERROR',
        error: error.message,
        offset,
      });
    } finally {
      processingCount--;
      // 다음 작업 처리
      processQueue();
    }
  }
}

self.addEventListener('message', async (e) => {
  const { type, file, offset, length } = e.data;

  if (type === 'READ_CHUNK') {
    queue.push({ file, offset, length });
    processQueue();
  }
});
