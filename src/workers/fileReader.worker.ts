self.addEventListener('message', async (e) => {
  const { type, file, offset, length } = e.data;

  if (type === 'READ_CHUNK') {
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
      });
    }
  }
});
