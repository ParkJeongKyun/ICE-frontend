/**
 * EXIF 데이터 추출을 위한 파일 읽기
 * 파일이 512KB 이하면 전체, 초과하면 앞/뒤 256KB씩 읽어서 병합
 */
export const readFileForExif = async (file: File): Promise<ArrayBuffer> => {
  const EXIF_READ_SIZE = 256 * 1024; // 256KB

  if (file.size <= EXIF_READ_SIZE * 2) {
    // 파일이 512KB 이하: 전체 읽기
    return file.arrayBuffer();
  }

  // 파일이 512KB 초과: 앞 256KB + 뒤 256KB
  const [headBuffer, tailBuffer] = await Promise.all([
    file.slice(0, EXIF_READ_SIZE).arrayBuffer(),
    file.slice(file.size - EXIF_READ_SIZE).arrayBuffer(),
  ]);

  // 병합
  const total = new Uint8Array(EXIF_READ_SIZE * 2);
  total.set(new Uint8Array(headBuffer), 0);
  total.set(new Uint8Array(tailBuffer), EXIF_READ_SIZE);

  return total.buffer;
};

/**
 * 전체 파일 읽기
 */
export const readFile = (file: File): Promise<ArrayBuffer> => {
  return file.arrayBuffer();
};
