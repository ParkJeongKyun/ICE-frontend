import { useCallback } from 'react';
import { CHUNK_SIZE, LAYOUT } from '@/constants/hexViewer';

interface UseHexViewerWorkerProps {
  file: File | undefined;
  fileWorker: Worker | null;
  activeKey: string;
  fileSize: number;
  rowCount: number;
  setWorkerCache: (key: string, data: any) => void;
  chunkCacheRef: React.MutableRefObject<Map<number, Uint8Array>>; // ✅ 수정
  requestedChunksRef: React.MutableRefObject<Set<number>>; // ✅ 수정
  setRenderTrigger: React.Dispatch<React.SetStateAction<number>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  colorsRef: React.RefObject<any>;
  isDraggingRef: React.MutableRefObject<boolean>; // ✅ 수정
  workerMessageHandlerRef: React.MutableRefObject<
    ((e: MessageEvent) => void) | null
  >; // ✅ 수정
  isInitialLoadingRef: React.MutableRefObject<boolean>; // ✅ 수정
  canvasSizeRef: React.MutableRefObject<{ width: number; height: number }>; // ✅ 수정
  visibleRows: number;
  checkCacheSize: () => void;
}

export const useHexViewerWorker = ({
  file,
  fileWorker,
  activeKey,
  fileSize,
  rowCount,
  setWorkerCache,
  chunkCacheRef,
  requestedChunksRef,
  setRenderTrigger,
  canvasRef,
  colorsRef,
  isDraggingRef,
  workerMessageHandlerRef,
  isInitialLoadingRef,
  canvasSizeRef,
  visibleRows,
  checkCacheSize,
}: UseHexViewerWorkerProps) => {
  const requestChunks = useCallback(
    (
      startRow: number,
      worker: Worker,
      currentFile: File,
      currentFileSize: number,
      currentVisibleRows: number
    ) => {
      const startByte = startRow * LAYOUT.bytesPerRow;
      const endByte = Math.min(
        startByte + currentVisibleRows * LAYOUT.bytesPerRow,
        currentFileSize
      );
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);

      for (let i = startChunk; i <= endChunk; i++) {
        const offset = i * CHUNK_SIZE;
        if (
          !chunkCacheRef.current?.has(offset) &&
          !requestedChunksRef.current?.has(offset)
        ) {
          requestedChunksRef.current?.add(offset);
          worker.postMessage({
            type: 'READ_CHUNK',
            file: currentFile,
            offset,
            length: Math.min(CHUNK_SIZE, currentFileSize - offset),
            priority: Math.abs(offset - startByte),
          });
        }
      }
    },
    [chunkCacheRef, requestedChunksRef]
  );

  const initializeWorker = useCallback(
    async (initialPosition: number): Promise<void> => {
      if (!file || !fileWorker) return;

      requestedChunksRef.current?.clear();

      // ✅ 초기 청크 로드
      const startByte = initialPosition * LAYOUT.bytesPerRow;
      const chunkOffset = Math.floor(startByte / CHUNK_SIZE) * CHUNK_SIZE;

      try {
        const blob = file.slice(chunkOffset, chunkOffset + CHUNK_SIZE);
        const data = new Uint8Array(await blob.arrayBuffer());
        const cache = new Map<number, Uint8Array>();
        cache.set(chunkOffset, data);

        if (chunkCacheRef.current) chunkCacheRef.current = cache;
        requestedChunksRef.current?.add(chunkOffset);

        // ✅ Worker 메시지 핸들러
        const handleWorkerMessage = (e: MessageEvent) => {
          const { type, offset, data } = e.data;
          if (type === 'CHUNK_DATA') {
            cache.set(offset, data);
            if (chunkCacheRef.current) chunkCacheRef.current = cache;
            checkCacheSize();
            if (!isDraggingRef.current) setRenderTrigger((prev) => prev + 1);
          }
        };

        if (workerMessageHandlerRef.current) {
          fileWorker.removeEventListener(
            'message',
            workerMessageHandlerRef.current
          );
        }

        fileWorker.addEventListener('message', handleWorkerMessage);
        workerMessageHandlerRef.current = handleWorkerMessage;

        setWorkerCache(activeKey, {
          worker: fileWorker,
          cache,
          cleanup: () => {
            fileWorker.removeEventListener('message', handleWorkerMessage);
            if (workerMessageHandlerRef.current === handleWorkerMessage) {
              workerMessageHandlerRef.current = null;
            }
          },
        });

        requestChunks(
          initialPosition,
          fileWorker,
          file,
          fileSize,
          visibleRows + 20
        );

        isInitialLoadingRef.current = false;

        // ✅ 렌더링 트리거 (Promise 완료 후)
        setRenderTrigger((prev) => prev + 1);
      } catch (error) {
        console.error('[useHexViewerWorker] 초기화 실패:', error);
        throw error;
      }
    },
    [
      file,
      fileWorker,
      activeKey,
      fileSize,
      rowCount,
      visibleRows,
      setWorkerCache,
      requestChunks,
      chunkCacheRef,
      requestedChunksRef,
      setRenderTrigger,
      canvasRef,
      colorsRef,
      isDraggingRef,
      workerMessageHandlerRef,
      isInitialLoadingRef,
      canvasSizeRef,
      checkCacheSize,
    ]
  );

  return { requestChunks, initializeWorker };
};
