import { RefObject, useCallback, useRef } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import eventBus from '@/types/eventBus';
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
  const { activeData } = useTab();
  const { chunkWorker } = useWorker();

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
      requestedChunksRef.current?.clear();
      const cache = new Map<number, Uint8Array>();
      if (chunkCacheRef.current) chunkCacheRef.current = cache;

      const handleWorkerMessage = (e: MessageEvent) => {
        // 🚀 표준 규격에 맞춰 status와 data, errorCode를 추출
        const { status, data, errorCode } = e.data;

        if (status === 'SUCCESS') {
          const { offset, buffer } = data; // data 안에서 꺼냄
          const u8 = buffer ? new Uint8Array(buffer) : null;

          if (u8) {
            cache.set(offset, u8);
            if (chunkCacheRef.current) chunkCacheRef.current = cache;
            checkCacheSize();
            onChunkLoaded();
          }
          requestedChunksRef.current?.delete(offset);
        } else if (status === 'ERROR') {
          // ✅ HexViewer에서 청크 에러 완전히 관리
          const { offset } = data || {};
          if (offset !== undefined) requestedChunksRef.current?.delete(offset);

          console.error(
            `[HexViewer] Chunk Error at offset ${offset}:`,
            errorCode
          );
          // 사용자에게 에러 알림
          eventBus.emit('toast', { code: errorCode || 'CHUNK_READ_FAILED' });
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

      // ✅ 워커 스크립트 로딩 에러 처리 (critical error)
      chunkWorker.onerror = (event) => {
        console.error('[HexViewer] Chunk Worker Critical Error');
        eventBus.emit('toast', { code: 'CHUNK_WORKER_ERROR' });
      };

      // ✅ 워커에게 초기 데이터 로드 요청
      // 이 호출부터 워커가 processChunk를 실행하며 test error가 발동합니다.
      requestChunks(initialPosition, file, fileSize, visibleRows + 20);

      isInitialLoadingRef.current = false;
      onChunkLoaded();
    },
    [
      file,
      chunkWorker,
      fileSize,
      visibleRows,
      requestChunks,
      onChunkLoaded,
      checkCacheSize,
      requestedChunksRef,
      chunkCacheRef,
    ]
  );

  return { requestChunks, initializeWorker };
};
