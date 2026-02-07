import { RefObject, useCallback, useRef } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { CHUNK_SIZE, LAYOUT } from '@/constants/hexViewer';

interface UseHexViewerWorkerProps {
  chunkCacheRef: RefObject<Map<number, Uint8Array>>;
  requestedChunksRef: RefObject<Set<number>>;
  onChunkLoaded: () => void;
  isInitialLoadingRef: RefObject<boolean>;
  visibleRows: number;
  checkCacheSize: () => void;
}

export const useHexViewerWorker = ({
  chunkCacheRef,
  requestedChunksRef,
  onChunkLoaded,
  isInitialLoadingRef,
  visibleRows,
  checkCacheSize,
}: UseHexViewerWorkerProps) => {
  const { activeKey, activeData } = useTab();
  const { chunkWorker, setWorkerCache } = useWorker();

  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(
    null
  );

  const requestChunks = useCallback(
    (
      startRow: number,
      currentFile: File,
      currentFileSize: number,
      currentVisibleRows: number
    ) => {
      if (!chunkWorker) return;

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
          chunkWorker.postMessage({
            type: 'READ_CHUNK',
            file: currentFile,
            offset,
            length: Math.min(CHUNK_SIZE, currentFileSize - offset),
            priority: Math.abs(offset - startByte),
          });
        }
      }
    },
    [chunkWorker, chunkCacheRef, requestedChunksRef]
  );

  const initializeWorker = useCallback(
    async (initialPosition: number): Promise<void> => {
      if (!file || !chunkWorker) return;
      if (fileSize === 0) {
        const cache = new Map<number, Uint8Array>();
        if (chunkCacheRef.current) chunkCacheRef.current = cache;

        const handleWorkerMessage = (e: MessageEvent) => {
          const { type, offset, buffer, data } = e.data;
          if (type === 'CHUNK_DATA') {
            const u8 = buffer ? new Uint8Array(buffer) : data ? data : null;
            if (u8) {
              cache.set(offset, u8);
              if (chunkCacheRef.current) chunkCacheRef.current = cache;
              checkCacheSize();
              onChunkLoaded();
            }
          }
        };

        if (workerMessageHandlerRef.current) {
          chunkWorker.removeEventListener(
            'message',
            workerMessageHandlerRef.current
          );
        }

        chunkWorker.addEventListener('message', handleWorkerMessage);
        workerMessageHandlerRef.current = handleWorkerMessage;

        setWorkerCache(activeKey, {
          cache,
          cleanup: () => {
            chunkWorker.removeEventListener('message', handleWorkerMessage);
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
          const { type, offset, buffer, data } = e.data;
          if (type === 'CHUNK_DATA') {
            const u8 = buffer ? new Uint8Array(buffer) : data ? data : null;
            if (u8) {
              cache.set(offset, u8);
              if (chunkCacheRef.current) chunkCacheRef.current = cache;
              checkCacheSize();
              onChunkLoaded();
            }
          }
        };

        if (workerMessageHandlerRef.current) {
          chunkWorker.removeEventListener(
            'message',
            workerMessageHandlerRef.current
          );
        }

        chunkWorker.addEventListener('message', handleWorkerMessage);
        workerMessageHandlerRef.current = handleWorkerMessage;

        setWorkerCache(activeKey, {
          cache,
          cleanup: () => {
            chunkWorker.removeEventListener('message', handleWorkerMessage);
            if (workerMessageHandlerRef.current === handleWorkerMessage) {
              workerMessageHandlerRef.current = null;
            }
          },
        });

        requestChunks(initialPosition, file, fileSize, visibleRows + 20);

        isInitialLoadingRef.current = false;
        onChunkLoaded();
      } catch (error) {
        console.error('[useHexViewerWorker] 초기화 실패:', error);
        throw error;
      }
    },
    [
      file,
      chunkWorker,
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
