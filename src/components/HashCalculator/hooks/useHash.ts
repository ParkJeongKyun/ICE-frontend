import { useCallback } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import type { HashType } from '@/types/hash';
import type { HashResult } from '@/types/worker/hash.worker.types';

export const useHash = () => {
  const { activeData } = useTab();
  const { hashManager } = useWorker();

  const file = activeData?.file;

  const executeHash = useCallback(
    async (hashType: HashType): Promise<HashResult | null> => {
      if (!hashManager) return null;

      try {
        const result = await hashManager.execute('PROCESS_HASH', {
          file,
          hashType,
        });

        return result;
      } catch (error) {
        // 취소 에러는 다시 throw (상위에서 처리)
        if (error instanceof Error && error.message === 'HASH_CANCELLED') {
          throw error;
        }
        console.error('[useHash] Hash execution failed:', error);
        return null;
      }
    },
    [file, hashManager]
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

  const cancelHash = useCallback(() => {
    if (hashManager) {
      hashManager.cancel();
    }
  }, [hashManager]);

  return {
    calculateSHA256,
    calculateSHA512,
    calculateMD5,
    calculateSHA1,
    executeHash,
    cancelHash,
  };
};
