import { useRef, useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { asciiToBytes } from '@/utils/hexViewer';
import { IndexInfo } from '@/components/HexViewer/HexViewer';
import type { SearchType } from '@/types/searcher';
import type { SearchResult } from '@/types/worker/analysis.worker.types';
import eventBus from '@/types/eventBus';

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
      startProcessing();

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
        eventBus.emit('toast', {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Search failed',
        });
        throw error;
      } finally {
        stopProcessing();
      }
    },
    [file, analysisManager, activeKey, startProcessing, stopProcessing]
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

  const cleanup = useCallback(() => {
    // cleanup is handled by WorkerManager
  }, []);

  return {
    findByOffset,
    findAllByHex,
    findAllByAsciiText,
    cleanup,
    filterInput,
  };
};
