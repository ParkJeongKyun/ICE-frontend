import { SearchAction, SearchStateWithCache } from '@/types/searcher';

export const initialSearchState: SearchStateWithCache = {
  __cache__: new Map(),
};

export const searchReducer = (
  state: SearchStateWithCache,
  action: SearchAction
): SearchStateWithCache => {
  switch (action.type) {
    case 'SET_RESULTS':
      return {
        ...state,
        [action.key]: {
          results: action.results,
          currentIndex: action.results.length > 0 ? 0 : -1,
          inputValue: action.inputValue,
          searchType: action.searchType,
          tabKey: action.tabKey,
        },
      };
    case 'SET_CURRENT_INDEX': {
      const currentResult = state[action.key];
      if (!currentResult || currentResult instanceof Map) return state;

      return {
        ...state,
        [action.key]: {
          ...currentResult,
          currentIndex: action.index,
        },
      };
    }
    case 'RESET_RESULTS':
      return {
        __cache__: state.__cache__,
      };
    case 'SET_CACHE': {
      const newCache = new Map(state.__cache__);
      newCache.set(action.cacheKey, action.results);

      if (newCache.size > 20) {
        const firstKey = newCache.keys().next().value;
        if (firstKey !== undefined) {
          newCache.delete(firstKey);
        }
      }

      return {
        ...state,
        __cache__: newCache,
      };
    }
    default:
      return state;
  }
};
