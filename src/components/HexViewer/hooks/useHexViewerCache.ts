import { useRef, useCallback } from 'react';
import { CHUNK_SIZE } from '@/constants/hexViewer';

export const useHexViewerCache = () => {
  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const requestedChunksRef = useRef<Set<number>>(new Set());

  const getByte = useCallback((index: number): number | null => {
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;

    const localIndex = index - chunkOffset;
    if (localIndex < 0 || localIndex >= chunk.length) return null;

    return chunk[localIndex] ?? null;
  }, []);

  const checkCacheSize = useCallback(() => {
    const MAX_CACHE_SIZE = 50 * 1024 * 1024;
    const cache = chunkCacheRef.current;

    let totalSize = 0;
    cache.forEach((chunk) => {
      totalSize += chunk.byteLength;
    });

    if (totalSize > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      const halfIndex = Math.floor(entries.length / 2);

      for (let i = 0; i < halfIndex; i++) {
        const [offset] = entries[i];
        cache.delete(offset);
        requestedChunksRef.current.delete(offset);
      }
    }
  }, []);

  return {
    chunkCacheRef,
    requestedChunksRef,
    getByte,
    checkCacheSize,
  };
};
