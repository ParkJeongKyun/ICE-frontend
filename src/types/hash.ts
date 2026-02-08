import { TabKey } from '@/types';

export type HashType = 'sha256' | 'sha512' | 'md5' | 'sha1';
export type HashCacheKey = string;

/**
 * 파일당 해시값 저장
 * {
 *   sha256: '...',
 *   sha512: '...',
 *   md5: '...',
 *   sha1: '...'
 * }
 */
export interface HashResult {
  sha256?: string;
  sha512?: string;
  md5?: string;
  sha1?: string;
  fileName: string;
  fileSize: number;
  lastCalculated?: {
    [key in HashType]?: number; // timestamp
  };
}

export interface HashStateWithCache {
  __cache__: Map<HashCacheKey, HashResult>;
  [key: string]: HashResult | Map<HashCacheKey, HashResult>;
}

export type HashAction =
  | {
      type: 'SET_HASH';
      key: TabKey;
      hashType: HashType;
      hashValue: string;
      fileName: string;
      fileSize: number;
    }
  | {
      type: 'SET_CACHE';
      cacheKey: HashCacheKey;
      result: HashResult;
    }
  | {
      type: 'RESET_HASHES';
      key: TabKey;
    }
  | {
      type: 'RESET_ALL';
    };
