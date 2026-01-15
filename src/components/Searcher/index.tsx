import Collapse from '@/components/common/Collapse';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useTranslation } from 'react-i18next';
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
import { IndexInfo } from '@/components/HexViewer';
import { TabKey } from '@/types';
import XIcon from '@/components/common/Icons/XIcon';
import ChevronLeftIcon from '@/components/common/Icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import SearchIcon from '@/components/common/Icons/SearchIcon';
import { useTab } from '@/contexts/TabDataContext';
import { useRefs } from '@/contexts/RefContext';
import { useMessage } from '@/contexts/MessageContext';
import { useSearch } from './hooks/useSearch';
import type {
  SearchType,
  SearchCacheKey,
  SearchResult,
  SearchStateWithCache,
  SearchAction,
} from '@/types/searcher';

export interface SearcherRef {
  findByOffset: (offset: string, shouldScroll?: boolean) => Promise<IndexInfo | null>;
  findAllByHex: (hex: string, shouldScroll?: boolean) => Promise<IndexInfo[] | null>;
  findAllByAsciiText: (text: string, ignoreCase: boolean, shouldScroll?: boolean) => Promise<IndexInfo[] | null>;
}

const initialState: SearchStateWithCache = {
  __cache__: new Map(),
};

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

const Searcher: React.ForwardRefRenderFunction<SearcherRef> = (_, ref) => {
  const { t } = useTranslation();
  const { hexViewerRef } = useRefs();
  const { activeKey } = useTab();
  const { showMessage } = useMessage();
  const [searchResults, dispatch] = useReducer(reducer, initialState);
  const [searchType, setSearchType] = useState<SearchType>('hex');
  const [inputValue, setInputValue] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const searchTabKeyRef = useRef<TabKey>(activeKey);

  const { findByOffset, findAllByHex, findAllByAsciiText, cleanup: cleanupSearch, filterInput } = useSearch();

  const getCacheKey = useCallback(
    (tabKey: TabKey, type: SearchType, value: string): SearchCacheKey => {
      const caseKey = type === 'ascii' ? (ignoreCase ? ':ic' : ':cs') : '';
      return `${tabKey}:${type}:${value}${caseKey}`;
    },
    [ignoreCase]
  );

  const search = useCallback(
    async (inputValue: string, type: SearchType, shouldScroll = true) => {
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
        
        if (cachedResults.length > 0) {
          showMessage('SEARCH_SUCCESS', t('searcher.success', { count: cachedResults.length }));
        } else {
          showMessage('SEARCH_NO_RESULTS');
        }
        
        // shouldScroll=true면 첫 번째 결과로 직접 스크롤
        if (shouldScroll && cachedResults.length > 0 && hexViewerRef.current) {
          hexViewerRef.current.scrollToIndex(cachedResults[0].index, cachedResults[0].offset);
        }
        return;
      }

      if (import.meta.env.DEV) {
        console.log('[Searcher] 캐시 MISS:', cacheKey);
      }

      let results: IndexInfo[] = [];
      if (type === 'hex') {
        results = (await findAllByHex(inputValue)) || [];
      } else if (type === 'ascii') {
        results = (await findAllByAsciiText(inputValue, ignoreCase)) || [];
      }

      if (searchTabKeyRef.current === activeKey) {
        dispatch({
          type: 'SET_RESULTS',
          key: activeKey,
          results,
          inputValue,
          searchType: type,
          tabKey: activeKey,
        });

        dispatch({
          type: 'SET_CACHE',
          cacheKey,
          results,
        });

        // shouldScroll=true면 첫 번째 결과로 직접 스크롤
        if (shouldScroll && results.length > 0 && hexViewerRef.current) {
          hexViewerRef.current.scrollToIndex(results[0].index, results[0].offset);
        }
      }
    },
    [activeKey, ignoreCase, getCacheKey, searchResults.__cache__, findAllByHex, findAllByAsciiText, showMessage, hexViewerRef]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filteredValue = filterInput(e.target.value, searchType);
      setInputValue(filteredValue);
    },
    [filterInput, searchType]
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

  useEffect(() => {
    return () => {
      cleanupSearch();
    };
  }, [cleanupSearch]);

  useImperativeHandle(
    ref,
    () => ({
      // shouldScroll=true면 직접 스크롤, false면 상태 업데이트만 (useEffect에서 처리)
      findByOffset: async (offset: string, shouldScroll = true) => {
        if (!offset.trim()) {
          showMessage('SEARCH_NO_INPUT');
          return null;
        }

        const result = await findByOffset(offset);
        
        if (result === null) {
          // findByOffset는 내부적으로 유효성 검사 후 null 반환
          // 범위 외 또는 잘못된 입력
          const byteOffset = parseInt(offset, 16);
          if (isNaN(byteOffset)) {
            showMessage('SEARCH_INVALID_HEX');
          } else {
            showMessage('SEARCH_OFFSET_OUT_OF_RANGE');
          }
          return null;
        }

        if (shouldScroll && hexViewerRef.current) {
          hexViewerRef.current.scrollToIndex(result.index, result.offset);
        }
        return result;
      },
      // search 함수를 활용해서 캐시, dispatch, 메시지까지 처리
      findAllByHex: async (hex: string, shouldScroll = true) => {
        await search(hex, 'hex', shouldScroll);
        const result = searchResults[activeKey];
        return result && !(result instanceof Map) ? result.results : null;
      },
      // search 함수를 활용해서 캐시, dispatch, 메시지까지 처리
      findAllByAsciiText: async (text: string, ignoreCase: boolean, shouldScroll = true) => {
        // ignoreCase 변경이 필요하면 state 업데이트
        setIgnoreCase(ignoreCase);
        await search(text, 'ascii', shouldScroll);
        const result = searchResults[activeKey];
        return result && !(result instanceof Map) ? result.results : null;
      },
    }),
    [findByOffset, search, searchResults, activeKey, hexViewerRef, showMessage]
  );

  return (
    <Collapse title={t('searcher.title')} open>
      <SearchDiv>
        <SearchLabel>{t('searcher.typeLabel')}</SearchLabel>
        <SearchData>
          <SearchSelect value={searchType} onChange={handleSearchTypeChange}>
            <option value="hex">{t('searcher.hexOption')}</option>
            <option value="ascii">{t('searcher.asciiOption')}</option>
          </SearchSelect>
        </SearchData>
      </SearchDiv>
      <SearchDiv>
        <SearchLabel>{t('searcher.searchLabel')}</SearchLabel>
        <SearchData style={{ display: 'flex' }}>
          <SearchInput
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyPress}
            maxLength={50}
            placeholder={t('searcher.placeholder', { type: searchType.toUpperCase() })}
          />
          {searchType === 'ascii' && (
            <ButtonDiv
              onClick={() => setIgnoreCase((prev) => !prev)}
              title={ignoreCase ? t('searcher.caseInsensitiveTooltip') : t('searcher.caseSensitiveTooltip')}
              style={{
                opacity: ignoreCase ? 1 : 0.4,
                fontWeight: ignoreCase ? 600 : 400,
              }}
            >
              {t('searcher.caseSensitiveToggle')}
            </ButtonDiv>
          )}
          <ButtonDiv
            onClick={() => inputValue && search(inputValue, searchType)}
            title={t('searcher.searchTooltip')}
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
                        title={t('searcher.maxResultsTooltip')}
                      >
                        {t('searcher.maxResults')}
                      </span>
                    )}
                </>
              ) : (
                <span>{t('searcher.foundOne')}</span>
              )}
            </Result>
            <NavigationButtons>
              <ButtonDiv
                onClick={handlePrevButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
                title={t('searcher.prevTooltip')}
              >
                <ChevronLeftIcon width={16} height={16} />
              </ButtonDiv>
              <ButtonDiv
                onClick={handleNextButtonClick}
                $disabled={
                  (searchResults[activeKey] as SearchResult).results.length <= 1
                }
                title={t('searcher.nextTooltip')}
              >
                <ChevronRightIcon width={16} height={16} />
              </ButtonDiv>
              <ButtonDiv onClick={handleResetButtonClick} title={t('searcher.resetTooltip')}>
                <XIcon height={16} width={16} />
              </ButtonDiv>
            </NavigationButtons>
          </>
        ) : null}
      </SearchResultBar>
    </Collapse>
  );
};

export default React.memo(forwardRef<SearcherRef>(Searcher));
