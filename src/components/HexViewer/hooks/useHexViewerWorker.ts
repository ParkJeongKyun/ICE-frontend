import { RefObject, useCallback, useRef } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext';
import { CHUNK_SIZE, LAYOUT } from '@/constants/hexViewer';

interface UseHexViewerWorkerProps {
  chunkCacheRef: RefObject<Map<number, Uint8Array>>;
  requestedChunksRef: RefObject<Set<number>>;
  onChunkLoaded: () => void;
  isDraggingRef: RefObject<boolean>;
  isInitialLoadingRef: RefObject<boolean>;
  visibleRows: number;
  checkCacheSize: () => void;
}

export const useHexViewerWorker = ({
  chunkCacheRef,
  requestedChunksRef,
  onChunkLoaded,
  isDraggingRef,
  isInitialLoadingRef,
  visibleRows,
  checkCacheSize,
}: UseHexViewerWorkerProps) => {
  const { activeKey, activeData } = useTabData();
  const { fileWorker, setWorkerCache } = useWorker();
  
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(
    null
  );

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
      if (fileSize === 0) {
        const cache = new Map<number, Uint8Array>();
        if (chunkCacheRef.current) chunkCacheRef.current = cache;

        const handleWorkerMessage = (e: MessageEvent) => {
          const { type, offset, data } = e.data;
          if (type === 'CHUNK_DATA') {
            cache.set(offset, data);
            if (chunkCacheRef.current) chunkCacheRef.current = cache;
            checkCacheSize();
            if (!isDraggingRef.current) onChunkLoaded();
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
          cache,
          cleanup: () => {
            fileWorker.removeEventListener('message', handleWorkerMessage);
            if (workerMessageHandlerRef.current === handleWorkerMessage) {
              workerMessageHandlerRef.current = null;
            }
          },
        });

        isInitialLoadingRef.current = false;
        onChunkLoaded();
        return;
      }

      requestedChunksRef.current?.clear();

      const startByte = initialPosition * LAYOUT.bytesPerRow;
      const chunkOffset = Math.floor(startByte / CHUNK_SIZE) * CHUNK_SIZE;

      try {
        const blob = file.slice(chunkOffset, chunkOffset + CHUNK_SIZE);
        const data = new Uint8Array(await blob.arrayBuffer());
        const cache = new Map<number, Uint8Array>();
        cache.set(chunkOffset, data);

        if (chunkCacheRef.current) chunkCacheRef.current = cache;
        requestedChunksRef.current?.add(chunkOffset);

        const handleWorkerMessage = (e: MessageEvent) => {
          const { type, offset, data } = e.data;
          if (type === 'CHUNK_DATA') {
            cache.set(offset, data);
            if (chunkCacheRef.current) chunkCacheRef.current = cache;
            checkCacheSize();
            if (!isDraggingRef.current) onChunkLoaded();
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
        onChunkLoaded();
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
      visibleRows,
      setWorkerCache,
      requestChunks,
      onChunkLoaded,
      checkCacheSize,
    ]
  );

  return { requestChunks, initializeWorker };
};
