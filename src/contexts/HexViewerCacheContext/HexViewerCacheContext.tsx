'use client';
import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { CHUNK_SIZE } from '@/constants/hexViewer';

interface HexViewerCacheContextType {
  chunkCacheRef: React.RefObject<Map<number, Uint8Array>>;
  requestedChunksRef: React.RefObject<Set<number>>;
  getByte: (index: number) => number | null;
  checkCacheSize: () => void;
}

const HexViewerCacheContext = createContext<
  HexViewerCacheContextType | undefined
>(undefined);

export const HexViewerCacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

  // Memoize the context value to avoid recreating the object on every render
  const contextValue = React.useMemo(
    () => ({ chunkCacheRef, requestedChunksRef, getByte, checkCacheSize }),
    [getByte, checkCacheSize]
  );

  return (
    <HexViewerCacheContext.Provider value={contextValue}>
      {children}
    </HexViewerCacheContext.Provider>
  );
};

export const useHexViewerCacheContext = () => {
  const ctx = useContext(HexViewerCacheContext);
  if (!ctx)
    throw new Error(
      'useHexViewerCacheContext must be used within HexViewerCacheProvider'
    );
  return ctx;
};
