import Collapse from '@/components/common/Collapse';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  ButtonDiv,
  SearchBtn,
  Result,
  ResultDiv,
  SearchData,
  SearchDiv,
  SearchInput,
  SearchLabel,
  TextDiv,
  SearchSelect,
  ResetBtn,
  SearchCheckBox,
} from './index.styles';
import { HexViewerRef, IndexInfo } from '@/components/HexViewer';
import Tooltip from '@/components/common/Tooltip';
import { TabKey } from '@/types';
import XIcon from '@/components/common/Icons/XIcon';
import { useTabData } from '@/contexts/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

type TSearchType = 'offset' | 'hex' | 'ascii';

interface SearchResult {
  results: IndexInfo[];
  currentIndex: number;
  inputValue: string;
  searchType: TSearchType;
  tabKey: TabKey;
}

// ✅ 캐시 키 타입 추가
type SearchCacheKey = string;

// ✅ 타입 수정: 인덱스 시그니처 제거하고 명시적으로 정의
interface SearchStateWithCache {
  __cache__: Map<SearchCacheKey, IndexInfo[]>;
  [key: string]: SearchResult | Map<SearchCacheKey, IndexInfo[]>; // ✅ union 타입으로
}

// ✅ initialState 타입 명시
const initialState: SearchStateWithCache = {
  __cache__: new Map(),
};

type Action =
  | {
      type: 'SET_RESULTS';
      key: TabKey;
      results: IndexInfo[];
      inputValue: string;
      searchType: TSearchType;
      tabKey: TabKey;
    }
  | { type: 'SET_CURRENT_INDEX'; key: TabKey; index: number }
  | { type: 'RESET_RESULTS' }
  | {
      type: 'SET_CACHE';
      cacheKey: SearchCacheKey;
      results: IndexInfo[];
    };

// ✅ Reducer 타입 수정
const reducer = (
  state: SearchStateWithCache,
  action: Action
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
    case 'SET_CURRENT_INDEX':
      const currentResult = state[action.key];
      if (!currentResult || currentResult instanceof Map) return state; // ✅ 타입 가드

      return {
        ...state,
        [action.key]: {
          ...currentResult,
          currentIndex: action.index,
        },
      };
    case 'RESET_RESULTS':
      return {
        __cache__: state.__cache__,
      };
    case 'SET_CACHE':
      const newCache = new Map(state.__cache__);
      newCache.set(action.cacheKey, action.results);

      // ✅ LRU: 최대 20개까지만 유지
      if (newCache.size > 20) {
        const firstKey = newCache.keys().next().value;
        newCache.delete(firstKey);
      }

      return {
        ...state,
        __cache__: newCache,
      };
    default:
      return state;
  }
};

const filterInput = (inputValue: string, type: TSearchType) => {
  switch (type) {
    case 'offset':
    case 'hex':
      return inputValue.replace(/[^0-9a-fA-F]/g, '');
    case 'ascii':
      return inputValue.replace(/[^\x00-\x7F]/g, '');
    default:
      return inputValue;
  }
};

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const { activeKey } = useTabData();
  const { fileWorker } = useProcess();
  const [searchResults, dispatch] = useReducer(reducer, initialState);
  const [searchType, setSearchType] = useState<TSearchType>('offset');
  const [inputValue, setInputValue] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const searchTabKeyRef = useRef<TabKey>(activeKey);
  const currentSearchIdRef = useRef<number | null>(null);

  // ✅ 캐시 키 생성 함수
  const getCacheKey = useCallback(
    (tabKey: TabKey, type: TSearchType, value: string): SearchCacheKey => {
      const caseKey = type === 'ascii' ? (ignoreCase ? ':ic' : ':cs') : '';
      return `${tabKey}:${type}:${value}${caseKey}`;
    },
    [ignoreCase]
  );

  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const search = useCallback(
    async (inputValue: string, type: TSearchType) => {
      if (!hexViewerRef.current) return;

      searchTabKeyRef.current = activeKey;

      // ✅ 캐시 확인
      const cacheKey = getCacheKey(activeKey, type, inputValue);
      const cachedResults = searchResults.__cache__.get(cacheKey);

      if (cachedResults) {
        console.log('✅ 캐시 HIT:', cacheKey);
        setCacheStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
        dispatch({
          type: 'SET_RESULTS',
          key: activeKey,
          results: cachedResults,
          inputValue,
          searchType: type,
          tabKey: activeKey,
        });
        return;
      } else {
        console.log('❌ 캐시 MISS:', cacheKey);
        setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
      }

      // ✅ 캐시 없으면 새로 검색
      let results: IndexInfo[] = [];
      if (type === 'offset') {
        const res = await hexViewerRef.current.findByOffset(inputValue);
        results = res ? [res] : [];
      } else if (type === 'hex') {
        results = (await hexViewerRef.current.findAllByHex(inputValue)) || [];
      } else if (type === 'ascii') {
        results =
          (await hexViewerRef.current.findAllByAsciiText(
            inputValue,
            ignoreCase
          )) || [];
      }

      // ✅ 검색 ID 저장 (HEX, ASCII만)
      if (type === 'hex' || type === 'ascii') {
        currentSearchIdRef.current = Date.now();
      }

      // ✅ 탭 검증 후 저장
      if (searchTabKeyRef.current === activeKey) {
        dispatch({
          type: 'SET_RESULTS',
          key: activeKey,
          results,
          inputValue,
          searchType: type,
          tabKey: activeKey,
        });

        // ✅ offset은 캐시하지 않음
        if (results.length > 0 && type !== 'offset') {
          dispatch({
            type: 'SET_CACHE',
            cacheKey,
            results,
          });
        }
      }
    },
    [hexViewerRef, activeKey, ignoreCase, getCacheKey, searchResults.__cache__]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filteredValue = filterInput(e.target.value, searchType);
      setInputValue(filteredValue);
    },
    [searchType]
  );

  const handleInputKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue) {
        await search(inputValue, searchType);
      }
    },
    [inputValue, search, searchType]
  );

  const handleSearchTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSearchType(e.target.value as TSearchType);
    },
    []
  );

  const handlePrevButtonClick = useCallback(() => {
    const result = searchResults[activeKey];
    // ✅ 타입 가드 추가
    if (!result || result instanceof Map || result.results.length <= 1) return;

    dispatch({
      type: 'SET_CURRENT_INDEX',
      key: activeKey,
      index:
        result.currentIndex > 0
          ? result.currentIndex - 1
          : result.results.length - 1,
    });
  }, [activeKey, searchResults]);

  const handleNextButtonClick = useCallback(() => {
    const result = searchResults[activeKey];
    // ✅ 타입 가드 추가
    if (!result || result instanceof Map || result.results.length <= 1) return;

    dispatch({
      type: 'SET_CURRENT_INDEX',
      key: activeKey,
      index:
        result.currentIndex < result.results.length - 1
          ? result.currentIndex + 1
          : 0,
    });
  }, [activeKey, searchResults]);

  const handleResetButtonClick = useCallback(() => {
    dispatch({ type: 'RESET_RESULTS' });
    setInputValue('');
  }, []);

  // ✅ 현재 활성 탭의 결과만 표시
  const currentResult = useMemo(() => {
    const result = searchResults[activeKey];
    if (
      !result ||
      result instanceof Map ||
      result.tabKey !== activeKey ||
      result.currentIndex < 0
    ) {
      return null;
    }
    return result.results[result.currentIndex] || null;
  }, [searchResults, activeKey]);

  useEffect(() => {
    if (currentResult && hexViewerRef.current) {
      hexViewerRef.current.scrollToIndex(
        currentResult.index,
        currentResult.offset
      );
    }
  }, [currentResult, hexViewerRef]);

  useEffect(() => {
    setInputValue('');
  }, [searchType]);

  // ✅ 탭 전환 시 검색 취소
  useEffect(() => {
    return () => {
      if (currentSearchIdRef.current && fileWorker) {
        fileWorker.postMessage({
          type: 'CANCEL_SEARCH',
          searchId: currentSearchIdRef.current,
        });
        currentSearchIdRef.current = null;
      }
    };
  }, [activeKey, fileWorker]);

  // ✅ 캐시 통계 표시 (개발 모드)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Searcher] 검색 캐시:', {
        size: searchResults.__cache__.size,
        keys: Array.from(searchResults.__cache__.keys()),
      });
    }
  }, [searchResults.__cache__]);

  return (
    <Collapse title="Search" open>
      <SearchDiv>
        <SearchLabel>타입</SearchLabel>
        <SearchData>
          <SearchSelect value={searchType} onChange={handleSearchTypeChange}>
            <option value="offset">Offset</option>
            <option value="hex">Hex</option>
            <option value="ascii">ASCII</option>
          </SearchSelect>
        </SearchData>
      </SearchDiv>
      <SearchDiv>
        <SearchLabel>검색어</SearchLabel>
        <SearchData style={{ display: 'flex', gap: 8 }}>
          <Tooltip text="엔터시 검색">
            <SearchInput
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyPress}
              maxLength={searchType === 'offset' ? 8 : 50}
              placeholder={`${searchType} 값을 입력하세요.`}
            />
          </Tooltip>
          <SearchBtn
            onClick={() => inputValue && search(inputValue, searchType)}
          >
            SEARCH
          </SearchBtn>
        </SearchData>
      </SearchDiv>
      {searchType == 'ascii' && (
        <SearchDiv>
          <SearchCheckBox onClick={() => setIgnoreCase((prev) => !prev)}>
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            <span>대소문자를 구분하지 않음</span>
          </SearchCheckBox>
        </SearchDiv>
      )}
      {searchResults[activeKey] &&
        !(searchResults[activeKey] instanceof Map) &&
        (searchResults[activeKey] as SearchResult).results.length > 0 && (
          <ResultDiv>
            <TextDiv>
              <Result>
                <Tooltip text="최대 1000개까지 검색 가능">
                  총{' '}
                  <span style={{ color: 'var(--ice-main-color_1)' }}>
                    {(searchResults[activeKey] as SearchResult).results.length}
                  </span>
                  개의 결과{' '}
                  {(searchResults[activeKey] as SearchResult).results.length >
                    1 && (
                    <>
                      중{' '}
                      <span style={{ color: 'var(--ice-main-color)' }}>
                        {(searchResults[activeKey] as SearchResult)
                          .currentIndex + 1}
                      </span>
                      번째
                    </>
                  )}
                </Tooltip>
                <ResetBtn onClick={handleResetButtonClick}>
                  <Tooltip text="검색 종료">
                    <XIcon height={15} width={15} />
                  </Tooltip>
                </ResetBtn>
              </Result>
            </TextDiv>
            <ButtonDiv>
              <SearchBtn
                onClick={handlePrevButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
              >
                PREV
              </SearchBtn>
              <SearchBtn
                onClick={handleNextButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
              >
                NEXT
              </SearchBtn>
            </ButtonDiv>
          </ResultDiv>
        )}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            marginTop: 16,
            padding: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fontSize: 14,
          }}
        >
          <div>캐시 통계:</div>
          <div>HIT: {cacheStats.hits}</div>
          <div>MISS: {cacheStats.misses}</div>
        </div>
      )}
    </Collapse>
  );
};

export default React.memo(Searcher);
