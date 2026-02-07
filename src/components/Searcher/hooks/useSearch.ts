import { useRef, useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import { asciiToBytes } from '@/utils/hexViewer';
import { IndexInfo } from '@/components/HexViewer/HexViewer';
import type { SearchType } from '@/types/searcher';
import eventBus from '@/utils/eventBus';

const filterInput = (inputValue: string, type: SearchType) => {
  switch (type) {
    case 'hex':
      return inputValue.replace(/[^0-9a-fA-F]/g, '');
    case 'ascii':
      return inputValue.replace(/[^\x00-\x7F]/g, '');
    default:
      return inputValue;
  }
};

export const useSearch = () => {
  const { activeKey, activeData } = useTab();
  const { startProcessing, stopProcessing } = useProcess();
  const { analysisManager } = useWorker();
  const { showMessage } = useMessage();

  const file = activeData?.file;
  const fileSize = file?.size || 0;

  const hexSearchIdRef = useRef<number>(0);
  const asciiSearchIdRef = useRef<number>(0);
  const searchCleanupRef = useRef<Map<number, () => void>>(new Map());

  // ✅ 파일 크기에 따른 동적 타임아웃 계산 (최소 30초, 최대 5분)
  const getSearchTimeout = useCallback(() => {
    const GB = 1024 * 1024 * 1024;
    const baseTimeout = 30000; // 30초
    const timeoutPerGB = 30000; // GB당 30초 추가
    const maxTimeout = 300000; // 최대 5분

    const fileSizeInGB = fileSize / GB;
    const calculatedTimeout = baseTimeout + fileSizeInGB * timeoutPerGB;

    return Math.min(calculatedTimeout, maxTimeout);
  }, [fileSize]);

  const findByOffset = useCallback(
    async (offset: string, length: number = 1): Promise<IndexInfo | null> => {
      if (!offset.trim()) return null;
      const byteOffset = parseInt(offset, 16);
      if (isNaN(byteOffset) || byteOffset < 0 || byteOffset >= fileSize)
        return null;
      return { index: byteOffset, offset: length };
    },
    [fileSize]
  );

  const findAllByHex = useCallback(
    async (hex: string): Promise<IndexInfo[] | null> => {
      if (!file || !hex.trim() || !analysisManager) return null;

      const searchStartTabKey = activeKey;

      let hexPattern = hex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      // 홀수면 앞에 0을 붙임
      if (hexPattern.length % 2 !== 0) {
        hexPattern = '0' + hexPattern;
      }

      const patternBytes = new Uint8Array(
        hexPattern.match(/.{2}/g)!.map((b) => parseInt(b, 16))
      );

      const prevSearchId = hexSearchIdRef.current;
      if (prevSearchId > 0) {
        const prevCleanup = searchCleanupRef.current.get(prevSearchId);
        if (prevCleanup) {
          prevCleanup();
          searchCleanupRef.current.delete(prevSearchId);
        }
      }

      hexSearchIdRef.current += 1;
      const searchId = hexSearchIdRef.current;

      startProcessing();

      const searchTimeout = getSearchTimeout();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Search] Timeout: ${searchTimeout / 1000}s, Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)}GB`
        );
      }

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          stopProcessing();
          showMessage(
            'SEARCH_TIMEOUT',
            `검색 시간이 초과되었습니다. (${searchTimeout / 1000}초)`
          );
          reject(new Error('Search timeout'));
        }, searchTimeout);

        let lastProgressUpdate = 0;

        // ✅ 이벤트 기반으로 진행률 구독
        const handleProgress = (data: any) => {
          if (data.id === searchId) {
            const now = Date.now();
            if (now - lastProgressUpdate > 1000) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[Search] Progress: ${data.progress}%`);
              }
              eventBus.emit('progress', { progress: data.progress });
              lastProgressUpdate = now;
            }
          }
        };

        analysisManager.events.on('PROGRESS', handleProgress);

        // ✅ Promise 기반으로 검색 실행
        analysisManager
          .execute('SEARCH_HEX', {
            file,
            pattern: patternBytes,
            searchId,
          })
          .then((result: any) => {
            cleanup();
            stopProcessing();

            if (searchStartTabKey !== activeKey) {
              resolve(null);
              return;
            }

            if (result.error) {
              showMessage('SEARCH_ERROR', result.error);
              resolve(null);
              return;
            }

            if (result.indices && result.indices.length > 0) {
              showMessage(
                'SEARCH_SUCCESS',
                `${result.indices.length}개의 결과를 찾았습니다.`
              );
              resolve(result.indices);
            } else {
              showMessage('SEARCH_NO_RESULTS');
              resolve(result.indices || []);
            }
          })
          .catch((error: Error) => {
            cleanup();
            stopProcessing();
            showMessage('SEARCH_ERROR', error.message);
            reject(error);
          });

        const cleanup = () => {
          clearTimeout(timeoutId);
          analysisManager.events.off('PROGRESS', handleProgress);
          searchCleanupRef.current.delete(searchId);
        };

        searchCleanupRef.current.set(searchId, cleanup);
      });
    },
    [
      file,
      analysisManager,
      activeKey,
      startProcessing,
      stopProcessing,
      showMessage,
      getSearchTimeout,
      fileSize,
    ]
  );

  const findAllByAsciiText = useCallback(
    async (text: string, ignoreCase: boolean): Promise<IndexInfo[] | null> => {
      if (!file || !text.trim() || !analysisManager) return null;

      const searchStartTabKey = activeKey;
      const patternBytes = asciiToBytes(text);

      const prevSearchId = asciiSearchIdRef.current;
      if (prevSearchId > 0) {
        const prevCleanup = searchCleanupRef.current.get(prevSearchId);
        if (prevCleanup) {
          prevCleanup();
          searchCleanupRef.current.delete(prevSearchId);
        }
      }

      asciiSearchIdRef.current += 1;
      const searchId = asciiSearchIdRef.current;

      startProcessing();

      const searchTimeout = getSearchTimeout();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Search] Timeout: ${searchTimeout / 1000}s, Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)}GB`
        );
      }

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          stopProcessing();
          showMessage(
            'SEARCH_TIMEOUT',
            `검색 시간이 초과되었습니다. (${searchTimeout / 1000}초)`
          );
          reject(new Error('Search timeout'));
        }, searchTimeout);

        let lastProgressUpdate = 0;

        // ✅ 이벤트 기반으로 진행률 구독
        const handleProgress = (data: any) => {
          if (data.id === searchId) {
            const now = Date.now();
            if (now - lastProgressUpdate > 1000) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[Search] Progress: ${data.progress}%`);
              }
              eventBus.emit('progress', { progress: data.progress });
              lastProgressUpdate = now;
            }
          }
        };

        analysisManager.events.on('PROGRESS', handleProgress);

        // ✅ Promise 기반으로 검색 실행
        analysisManager
          .execute('SEARCH_ASCII', {
            file,
            pattern: patternBytes,
            ignoreCase,
            searchId,
          })
          .then((result: any) => {
            cleanup();
            stopProcessing();

            if (searchStartTabKey !== activeKey) {
              resolve(null);
              return;
            }

            if (result.error) {
              showMessage('SEARCH_ERROR', result.error);
              resolve(null);
              return;
            }

            resolve(result.indices || []);
          })
          .catch((error: Error) => {
            cleanup();
            stopProcessing();
            showMessage('SEARCH_ERROR', error.message);
            reject(error);
          });

        const cleanup = () => {
          clearTimeout(timeoutId);
          analysisManager.events.off('PROGRESS', handleProgress);
          searchCleanupRef.current.delete(searchId);
        };

        searchCleanupRef.current.set(searchId, cleanup);
      });
    },
    [
      file,
      analysisManager,
      activeKey,
      startProcessing,
      stopProcessing,
      showMessage,
      getSearchTimeout,
      fileSize,
    ]
  );

  const cleanup = useCallback(() => {
    searchCleanupRef.current.forEach((cleanup) => cleanup());
    searchCleanupRef.current.clear();
  }, []);

  return {
    findByOffset,
    findAllByHex,
    findAllByAsciiText,
    cleanup,
    filterInput,
  };
};
