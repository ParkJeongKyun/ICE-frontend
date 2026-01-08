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
  Result,
  SearchData,
  SearchDiv,
  SearchInput,
  SearchLabel,
  SearchSelect,
  SearchResultBar,
  NavigationButtons,
} from './index.styles';
import { HexViewerRef, IndexInfo } from '@/components/HexViewer';
import { TabKey } from '@/types';
import XIcon from '@/components/common/Icons/XIcon';
import ChevronLeftIcon from '@/components/common/Icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import SearchIcon from '@/components/common/Icons/SearchIcon';
import { useTabData } from '@/contexts/TabDataContext';
import type {
  SearchType,
  SearchCacheKey,
  SearchResult,
  SearchStateWithCache,
  SearchAction,
} from '@/types/searcher';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
}

const initialState: SearchStateWithCache = {
  __cache__: new Map(),
};

// ✅ SearchAction 사용
const reducer = (
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

      // ✅ LRU: 최대 20개까지만 유지
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

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const { activeKey } = useTabData();
  const [searchResults, dispatch] = useReducer(reducer, initialState);
  const [searchType, setSearchType] = useState<SearchType>('hex');
  const [inputValue, setInputValue] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const searchTabKeyRef = useRef<TabKey>(activeKey);

  // ✅ 캐시 키 생성 함수 - 타입 안전성 강화
  const getCacheKey = useCallback(
    (tabKey: TabKey, type: SearchType, value: string): SearchCacheKey => {
      const caseKey = type === 'ascii' ? (ignoreCase ? ':ic' : ':cs') : '';
      return `${tabKey}:${type}:${value}${caseKey}`;
    },
    [ignoreCase]
  );

  // ✅ 검색 함수 - fileWorker 제거 (HexViewer가 처리)
  const search = useCallback(
    async (inputValue: string, type: SearchType) => {
      if (!hexViewerRef.current) return;

      searchTabKeyRef.current = activeKey;

      const cacheKey = getCacheKey(activeKey, type, inputValue);
      const cachedResults = searchResults.__cache__.get(cacheKey);

      if (cachedResults) {
        if (import.meta.env.DEV) {
          console.log('[Searcher] 캐시 HIT:', cacheKey);
        }
        dispatch({
          type: 'SET_RESULTS',
          key: activeKey,
          results: cachedResults,
          inputValue,
          searchType: type,
          tabKey: activeKey,
        });
        return;
      }

      if (import.meta.env.DEV) {
        console.log('[Searcher] 캐시 MISS:', cacheKey);
      }

      // ✅ 검색 수행 (HexViewer가 Worker 처리)
      let results: IndexInfo[] = [];
      if (type === 'hex') {
        results = (await hexViewerRef.current.findAllByHex(inputValue)) || [];
      } else if (type === 'ascii') {
        results =
          (await hexViewerRef.current.findAllByAsciiText(
            inputValue,
            ignoreCase
          )) || [];
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

        // ✅ 캐시 저장
        if (results.length > 0) {
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
      setSearchType(e.target.value as SearchType);
    },
    []
  );

  const handlePrevButtonClick = useCallback(() => {
    const result = searchResults[activeKey];
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

  return (
    <Collapse title="Search" open>
      <SearchDiv>
        <SearchLabel>타입</SearchLabel>
        <SearchData>
          <SearchSelect value={searchType} onChange={handleSearchTypeChange}>
            <option value="hex">Hex</option>
            <option value="ascii">ASCII</option>
          </SearchSelect>
        </SearchData>
      </SearchDiv>
      <SearchDiv>
        <SearchLabel>검색어</SearchLabel>
        <SearchData style={{ display: 'flex' }}>
          <SearchInput
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyPress}
            maxLength={50}
            placeholder={`${searchType} 값을 입력하세요.`}
          />
          {searchType === 'ascii' && (
            <ButtonDiv
              onClick={() => setIgnoreCase((prev) => !prev)}
              title={ignoreCase ? '대소문자 구분 안함' : '대소문자 구분'}
              style={{
                opacity: ignoreCase ? 1 : 0.4,
                fontWeight: ignoreCase ? 600 : 400,
              }}
            >
              Aa
            </ButtonDiv>
          )}
          <ButtonDiv
            onClick={() => inputValue && search(inputValue, searchType)}
            title="검색"
          >
            <SearchIcon width={16} height={16} />
          </ButtonDiv>
        </SearchData>
      </SearchDiv>
      <SearchResultBar>
        {searchResults[activeKey] &&
        !(searchResults[activeKey] instanceof Map) &&
        (searchResults[activeKey] as SearchResult).results.length > 0 ? (
          <>
            <Result>
              {(searchResults[activeKey] as SearchResult).results.length > 1 ? (
                <>
                  <span
                    style={{ color: 'var(--ice-main-color)', fontWeight: 600 }}
                  >
                    {(searchResults[activeKey] as SearchResult).currentIndex +
                      1}
                  </span>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span>
                    {(searchResults[activeKey] as SearchResult).results.length}
                  </span>
                  {(searchResults[activeKey] as SearchResult).results.length >=
                    1000 && (
                    <span
                      style={{
                        opacity: 0.6,
                        fontSize: '0.6rem',
                        marginLeft: '2px',
                      }}
                      title="최대 1000개까지만 표시됩니다"
                    >
                      (max)
                    </span>
                  )}
                </>
              ) : (
                <span>1 found</span>
              )}
            </Result>
            <NavigationButtons>
              <ButtonDiv
                onClick={handlePrevButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
                title="이전"
              >
                <ChevronLeftIcon width={16} height={16} />
              </ButtonDiv>
              <ButtonDiv
                onClick={handleNextButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
                title="다음"
              >
                <ChevronRightIcon width={16} height={16} />
              </ButtonDiv>
              <ButtonDiv onClick={handleResetButtonClick} title="초기화">
                <XIcon height={16} width={16} />
              </ButtonDiv>
            </NavigationButtons>
          </>
        ) : null}
      </SearchResultBar>
    </Collapse>
  );
};

export default React.memo(Searcher);
