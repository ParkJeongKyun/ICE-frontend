import { HashAction, HashStateWithCache, HashResult } from '@/types/hash';

export const initialHashState: HashStateWithCache = {
  __cache__: new Map(),
};

export const hashReducer = (
  state: HashStateWithCache,
  action: HashAction
): HashStateWithCache => {
  switch (action.type) {
    case 'SET_HASH': {
      const existing = state[action.key];
      const currentResult: HashResult =
        existing && !(existing instanceof Map)
          ? (existing as HashResult)
          : {
              fileName: action.fileName,
              fileSize: action.fileSize,
              lastCalculated: {},
            };

      return {
        ...state,
        [action.key]: {
          ...currentResult,
          [action.hashType]: action.hashValue,
          fileName: action.fileName,
          fileSize: action.fileSize,
          lastCalculated: {
            ...currentResult.lastCalculated,
            [action.hashType]: Date.now(),
          },
        },
      };
    }

    case 'SET_CACHE': {
      const newCache = new Map(state.__cache__);
      newCache.set(action.cacheKey, action.result);

      // 캐시 크기 제한 (최대 20개)
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

    case 'RESET_HASHES': {
      const newState = { ...state };
      delete newState[action.key];
      return newState;
    }

    case 'RESET_ALL': {
      return {
        __cache__: state.__cache__,
      };
    }

    default:
      return state;
  }
};
