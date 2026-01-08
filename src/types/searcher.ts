import { TabKey } from '@/types';
import { IndexInfo } from '@/components/HexViewer';

export type SearchType = 'hex' | 'ascii';
export type SearchCacheKey = string;

export interface SearchResult {
  results: IndexInfo[];
  currentIndex: number;
  inputValue: string;
  searchType: SearchType;
  tabKey: TabKey;
}

export interface SearchStateWithCache {
  __cache__: Map<SearchCacheKey, IndexInfo[]>;
  [key: string]: SearchResult | Map<SearchCacheKey, IndexInfo[]>;
}

export type SearchAction =
  | {
      type: 'SET_RESULTS';
      key: TabKey;
      results: IndexInfo[];
      inputValue: string;
      searchType: SearchType;
      tabKey: TabKey;
    }
  | { type: 'SET_CURRENT_INDEX'; key: TabKey; index: number }
  | { type: 'RESET_RESULTS' }
  | {
      type: 'SET_CACHE';
      cacheKey: SearchCacheKey;
      results: IndexInfo[];
    };
