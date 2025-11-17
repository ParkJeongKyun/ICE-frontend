// 요청 큐 (동시 처리 제한)
const queue: Array<{ file: File; offset: number; length: number }> = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;
  
  processing = true;
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
  }
  
  processing = false;
  // 다음 작업 처리
  if (queue.length > 0) {
    processQueue();
  }
}

self.addEventListener('message', async (e) => {
  const { type, file, offset, length } = e.data;

  if (type === 'READ_CHUNK') {
    // 큐에 추가
    queue.push({ file, offset, length });
    processQueue();
  }
});
