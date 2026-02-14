import { useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { asciiToBytes } from '@/utils/hexViewer';
import { IndexInfo } from '@/components/HexViewer/HexViewer';
import type { SearchType } from '@/types/searcher';
import type { SearchResult } from '@/types/worker/analysis.worker.types';

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
  const { analysisManager } = useWorker();

  const file = activeData?.file;
  const fileSize = file?.size || 0;

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

  const executeSearch = useCallback(
    async (
      searchType: 'SEARCH_HEX' | 'SEARCH_ASCII',
      patternBytes: Uint8Array,
      ignoreCase?: boolean
    ): Promise<SearchResult | null> => {
      if (!analysisManager) return null;

      const searchStartTabKey = activeKey;

      try {
        const result = await analysisManager.execute(searchType, {
          file,
          pattern: patternBytes,
          ...(searchType === 'SEARCH_ASCII' && { ignoreCase }),
        });

        if (searchStartTabKey !== activeKey) {
          return null;
        }

        return result;
      } catch (error) {
        // 취소 에러는 다시 throw (상위에서 처리)
        if (error instanceof Error && error.message === 'SEARCH_CANCELLED') {
          throw error;
        }
        console.error('[useSearch] Search execution failed:', error);
        return null;
      }
    },
    [file, analysisManager, activeKey]
  );

  const findAllByHex = useCallback(
    async (hex: string): Promise<SearchResult | null> => {
      if (!file || !hex.trim() || !analysisManager) return null;

      let hexPattern = hex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      if (hexPattern.length % 2 !== 0) {
        hexPattern = '0' + hexPattern;
      }

      const patternBytes = new Uint8Array(
        hexPattern.match(/.{2}/g)!.map((b) => parseInt(b, 16))
      );

      return executeSearch('SEARCH_HEX', patternBytes);
    },
    [file, analysisManager, executeSearch]
  );

  const findAllByAsciiText = useCallback(
    async (text: string, ignoreCase: boolean): Promise<SearchResult | null> => {
      if (!file || !text.trim() || !analysisManager) return null;

      const patternBytes = asciiToBytes(text);
      return executeSearch('SEARCH_ASCII', patternBytes, ignoreCase);
    },
    [file, analysisManager, executeSearch]
  );

  const cancelSearch = useCallback(() => {
    if (analysisManager) {
      analysisManager.cancel('SEARCH_CANCELLED');
    }
  }, [analysisManager]);

  return {
    findByOffset,
    findAllByHex,
    findAllByAsciiText,
    cancelSearch,
    filterInput,
  };
};
