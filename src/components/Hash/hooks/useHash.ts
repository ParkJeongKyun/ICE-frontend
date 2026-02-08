import { useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import type { HashType } from '@/types/hash';
import type { HashResult } from '@/types/worker/hash.worker.types';
import eventBus from '@/types/eventBus';

export const useHash = () => {
  const { activeData } = useTab();
  const { startProcessing, stopProcessing } = useProcess();
  const { hashManager } = useWorker();

  const file = activeData?.file;

  const executeHash = useCallback(
    async (hashType: HashType): Promise<HashResult | null> => {
      if (!hashManager) return null;

      startProcessing();

      try {
        const result = await hashManager.execute('PROCESS_HASH', {
          file,
          hashType,
        });

        return result;
      } catch (error) {
        eventBus.emit('toast', {
          code: 'HASH_ERROR',
          message:
            error instanceof Error ? error.message : 'Hash calculation failed',
        });
        throw error;
      } finally {
        stopProcessing();
      }
    },
    [file, hashManager, startProcessing, stopProcessing]
  );

  const calculateSHA256 = useCallback(async (): Promise<HashResult | null> => {
    if (!file || !hashManager) return null;
    return executeHash('sha256');
  }, [file, hashManager, executeHash]);

  const calculateSHA512 = useCallback(async (): Promise<HashResult | null> => {
    if (!file || !hashManager) return null;
    return executeHash('sha512');
  }, [file, hashManager, executeHash]);

  const calculateMD5 = useCallback(async (): Promise<HashResult | null> => {
    if (!file || !hashManager) return null;
    return executeHash('md5');
  }, [file, hashManager, executeHash]);

  const calculateSHA1 = useCallback(async (): Promise<HashResult | null> => {
    if (!file || !hashManager) return null;
    return executeHash('sha1');
  }, [file, hashManager, executeHash]);

  return {
    calculateSHA256,
    calculateSHA512,
    calculateMD5,
    calculateSHA1,
    executeHash,
  };
};
