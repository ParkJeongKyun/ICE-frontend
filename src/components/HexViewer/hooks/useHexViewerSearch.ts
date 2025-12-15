import { useRef, useCallback, useImperativeHandle } from 'react';
import { asciiToBytes } from '@/utils/byteSearch';
import { IndexInfo } from '../index';

interface UseHexViewerSearchProps {
  file: File | undefined;
  fileSize: number;
  fileWorker: Worker | null;
  activeKey: string;
  setProcessInfo: (info: any) => void;
}

export const useHexViewerSearch = ({
  file,
  fileSize,
  fileWorker,
  activeKey,
  setProcessInfo,
}: UseHexViewerSearchProps) => {
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

      setProcessInfo({
        status: 'processing',
        type: 'Hex',
        message: '검색중...',
      });

      const hexPattern = hex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      if (hexPattern.length % 2 !== 0) {
        setProcessInfo({
          status: 'failure',
          type: 'Hex',
          message: 'HEX 길이 오류',
        });
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

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          setProcessInfo({
            status: 'failure',
            type: 'Hex',
            message: '검색 타임아웃',
          });
          reject(new Error('Search timeout'));
        }, 30000);

        const handleMessage = (e: MessageEvent) => {
          if (
            e.data.type === 'SEARCH_RESULT_HEX' &&
            e.data.searchId === searchId
          ) {
            cleanup();

            if (searchStartTabKey !== activeKey) {
              console.log('[HexViewer] 탭 변경으로 검색 결과 무시');
              resolve(null);
              return;
            }

            if (e.data.results && e.data.results.length > 0) {
              setProcessInfo({
                status: 'success',
                type: 'Hex',
                message: `검색 성공 (${e.data.results.length}개)${e.data.usedWasm ? ' [WASM]' : ' [JS]'}`,
              });
            } else {
              setProcessInfo({
                status: 'success',
                type: 'Hex',
                message: '검색 결과 없음',
              });
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
    [file, fileWorker, activeKey, setProcessInfo]
  );

  const findAllByAsciiText = useCallback(
    async (text: string, ignoreCase: boolean): Promise<IndexInfo[] | null> => {
      if (!file || !text.trim() || !fileWorker) return null;

      const searchStartTabKey = activeKey;

      setProcessInfo({
        status: 'processing',
        type: 'Ascii',
        message: '검색중...',
      });

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

      return new Promise<IndexInfo[] | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup();
          setProcessInfo({
            status: 'failure',
            type: 'Ascii',
            message: '검색 타임아웃',
          });
          reject(new Error('Search timeout'));
        }, 30000);

        const handleMessage = (e: MessageEvent) => {
          if (
            e.data.type === 'SEARCH_RESULT_ASCII' &&
            e.data.searchId === searchId
          ) {
            cleanup();

            if (searchStartTabKey !== activeKey) {
              console.log('[HexViewer] 탭 변경으로 검색 결과 무시');
              resolve(null);
              return;
            }

            if (e.data.results && e.data.results.length > 0) {
              setProcessInfo({
                status: 'success',
                type: 'Ascii',
                message: `검색 성공 (${e.data.results.length}개)${e.data.usedWasm ? ' [WASM]' : ' [JS]'}`,
              });
            } else {
              setProcessInfo({
                status: 'success',
                type: 'Ascii',
                message: '검색 결과 없음',
              });
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
    [file, fileWorker, activeKey, setProcessInfo]
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
