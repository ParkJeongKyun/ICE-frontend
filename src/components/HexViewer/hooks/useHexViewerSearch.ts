import { useRef, useCallback } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext';
import { useMessage } from '@/contexts/MessageContext';
import { asciiToBytes } from '@/utils/hexViewer';
import { IndexInfo } from '../index';
import { ERROR_MESSAGES } from '@/constants/messages';

export const useHexViewerSearch = () => {
  const { activeKey, activeData } = useTabData();
  const { startProcessing, stopProcessing } = useProcess();
  const { fileWorker } = useWorker();
  const { showError, showMessage } = useMessage();

  const file = activeData?.file;
  const fileSize = file?.size || 0;

  const hexSearchIdRef = useRef<number>(0);
  const asciiSearchIdRef = useRef<number>(0);
  const searchCleanupRef = useRef<Map<number, () => void>>(new Map());

  const findByOffset = useCallback(
    async (offset: string): Promise<IndexInfo | null> => {
      if (offset.trim()) {
        const byteOffset = parseInt(offset, 16);
        if (!isNaN(byteOffset) && byteOffset >= 0 && byteOffset < fileSize) {
          return { index: byteOffset, offset: 1 };
        }
      }
      return null;
    },
    [fileSize]
  );

  const findAllByHex = useCallback(
    async (hex: string): Promise<IndexInfo[] | null> => {
      if (!file || !hex.trim() || !fileWorker) return null;

      const searchStartTabKey = activeKey;

      const hexPattern = hex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      if (hexPattern.length % 2 !== 0) {
        showError('SEARCH_HEX_LENGTH_ERROR');
        return null;
      }

      const patternBytes = new Uint8Array(
        hexPattern.match(/.{2}/g)!.map((b) => parseInt(b, 16))
      );

      const prevSearchId = hexSearchIdRef.current;
      if (prevSearchId > 0) {
        fileWorker.postMessage({
          type: 'CANCEL_SEARCH',
          searchId: prevSearchId,
        });
        const prevCleanup = searchCleanupRef.current.get(prevSearchId);
        if (prevCleanup) {
          prevCleanup();
          searchCleanupRef.current.delete(prevSearchId);
        }
      }

      hexSearchIdRef.current += 1;
      const searchId = hexSearchIdRef.current;

      startProcessing();

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          stopProcessing();
          showError('SEARCH_TIMEOUT');
          reject(new Error('Search timeout'));
        }, 30000);

        const handleMessage = (e: MessageEvent) => {
          if (
            e.data.type === 'SEARCH_RESULT_HEX' &&
            e.data.searchId === searchId
          ) {
            cleanup();
            stopProcessing();

            if (searchStartTabKey !== activeKey) {
              resolve(null);
              return;
            }

            if (e.data.errorCode) {
              showError(e.data.errorCode, e.data.error);
              resolve(null);
              return;
            }

            if (e.data.results && e.data.results.length > 0) {
              showMessage({
                ...ERROR_MESSAGES.SEARCH_SUCCESS,
                message: `${e.data.results.length}개의 결과를 찾았습니다.`,
              });
            } else {
              showError('SEARCH_NO_RESULTS');
            }
            resolve(e.data.results);
          }
        };

        const cleanup = () => {
          clearTimeout(timeoutId);
          fileWorker.removeEventListener('message', handleMessage);
          searchCleanupRef.current.delete(searchId);
        };

        searchCleanupRef.current.set(searchId, cleanup);
        fileWorker.addEventListener('message', handleMessage);
        fileWorker.postMessage({
          type: 'SEARCH_HEX',
          file,
          pattern: patternBytes,
          searchId,
        });
      });
    },
    [file, fileWorker, activeKey, startProcessing, stopProcessing, showError, showMessage]
  );

  const findAllByAsciiText = useCallback(
    async (text: string, ignoreCase: boolean): Promise<IndexInfo[] | null> => {
      if (!file || !text.trim() || !fileWorker) return null;

      const searchStartTabKey = activeKey;
      const patternBytes = asciiToBytes(text);

      const prevSearchId = asciiSearchIdRef.current;
      if (prevSearchId > 0) {
        fileWorker.postMessage({
          type: 'CANCEL_SEARCH',
          searchId: prevSearchId,
        });
        const prevCleanup = searchCleanupRef.current.get(prevSearchId);
        if (prevCleanup) {
          prevCleanup();
          searchCleanupRef.current.delete(prevSearchId);
        }
      }

      asciiSearchIdRef.current += 1;
      const searchId = asciiSearchIdRef.current;

      startProcessing();

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          stopProcessing();
          showError('SEARCH_TIMEOUT');
          reject(new Error('Search timeout'));
        }, 30000);

        const handleMessage = (e: MessageEvent) => {
          if (
            e.data.type === 'SEARCH_RESULT_ASCII' &&
            e.data.searchId === searchId
          ) {
            cleanup();
            stopProcessing();

            if (searchStartTabKey !== activeKey) {
              resolve(null);
              return;
            }

            if (e.data.errorCode) {
              showError(e.data.errorCode, e.data.error);
              resolve(null);
              return;
            }

            if (e.data.results && e.data.results.length > 0) {
              showMessage({
                ...ERROR_MESSAGES.SEARCH_SUCCESS,
                message: `${e.data.results.length}개의 결과를 찾았습니다.`,
              });
            } else {
              showError('SEARCH_NO_RESULTS');
            }
            resolve(e.data.results);
          }
        };

        const cleanup = () => {
          clearTimeout(timeoutId);
          fileWorker.removeEventListener('message', handleMessage);
          searchCleanupRef.current.delete(searchId);
        };

        searchCleanupRef.current.set(searchId, cleanup);
        fileWorker.addEventListener('message', handleMessage);
        fileWorker.postMessage({
          type: 'SEARCH_ASCII',
          file,
          pattern: patternBytes,
          ignoreCase,
          searchId,
        });
      });
    },
    [file, fileWorker, activeKey, startProcessing, stopProcessing, showError, showMessage]
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
  };
};
