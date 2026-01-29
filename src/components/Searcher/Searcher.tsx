'use client';
import Collapse from '@/components/common/Collapse/Collapse';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
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
} from './Searcher.styles';
import { IndexInfo } from '@/components/HexViewer/HexViewer';
import { TabKey } from '@/types';
import XIcon from '@/components/common/Icons/XIcon';
import ChevronLeftIcon from '@/components/common/Icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import SearchIcon from '@/components/common/Icons/SearchIcon';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import { useSearch } from './hooks/useSearch';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import type {
  SearchType,
  SearchCacheKey,
  SearchResult,
  SearchStateWithCache,
  SearchAction,
} from '@/types/searcher';

export interface SearcherRef {
  findByOffset: (
    offset: string,
    length?: number,
    shouldScroll?: boolean
  ) => Promise<IndexInfo | null>;
  findAllByHex: (
    hex: string,
    shouldScroll?: boolean
  ) => Promise<IndexInfo[] | null>;
  findAllByAsciiText: (
    text: string,
    ignoreCase: boolean,
    shouldScroll?: boolean
  ) => Promise<IndexInfo[] | null>;
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

const Searcher: React.FC = () => {
  const t = useTranslations();
  const { hexViewerRef, setSearcherRef } = useRefs();
  const { activeKey } = useTab();
  const { showMessage } = useMessage();
  const [searchResults, dispatch] = useReducer(reducer, initialState);
  const [searchType, setSearchType] = useState<SearchType>('hex');
  const [inputValue, setInputValue] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const searchTabKeyRef = useRef<TabKey>(activeKey);

  const {
    findByOffset,
    findAllByHex,
    findAllByAsciiText,
    cleanup: cleanupSearch,
    filterInput,
  } = useSearch();

  // Exposed imperative methods (extracted so they can be registered into context)
  const findByOffsetLocal = React.useCallback(
    async (offset: string, length: number = 1, shouldScroll = true) => {
      if (!offset.trim()) {
        showMessage('SEARCH_NO_INPUT');
        return null;
      }

      const result = await findByOffset(offset, length);

      if (result === null) {
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
    [findByOffset, showMessage, hexViewerRef]
  );

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
        if (process.env.NODE_ENV === 'development') {
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
          showMessage(
            'SEARCH_SUCCESS',
            t('searcher.success', { count: cachedResults.length })
          );
        } else {
          showMessage('SEARCH_NO_RESULTS');
        }

        if (shouldScroll && cachedResults.length > 0 && hexViewerRef.current) {
          hexViewerRef.current.scrollToIndex(
            cachedResults[0].index,
            cachedResults[0].offset
          );
        }
        return;
      }

      if (process.env.NODE_ENV === 'development') {
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

        if (shouldScroll && results.length > 0 && hexViewerRef.current) {
          hexViewerRef.current.scrollToIndex(
            results[0].index,
            results[0].offset
          );
        }
      }
    },
    [
      activeKey,
      ignoreCase,
      getCacheKey,
      searchResults.__cache__,
      findAllByHex,
      findAllByAsciiText,
      showMessage,
      hexViewerRef,
    ]
  );

  const getResultsForActiveKey = () => {
    const result = searchResults[activeKey];
    return result && !(result instanceof Map) ? result.results : null;
  };

  const findAllByHexLocal = React.useCallback(
    async (hex: string, shouldScroll = true) => {
      await search(hex, 'hex', shouldScroll);
      return getResultsForActiveKey();
    },
    [search, activeKey, searchResults]
  );

  const findAllByAsciiTextLocal = React.useCallback(
    async (text: string, ignoreCaseParam: boolean, shouldScroll = true) => {
      setIgnoreCase(ignoreCaseParam);
      await search(text, 'ascii', shouldScroll);
      return getResultsForActiveKey();
    },
    [search, activeKey, searchResults]
  );

  // Register into context for other components to use
  React.useEffect(() => {
    if (setSearcherRef) {
      setSearcherRef({
        findByOffset: findByOffsetLocal,
        findAllByHex: findAllByHexLocal,
        findAllByAsciiText: findAllByAsciiTextLocal,
      });
      return () => setSearcherRef(null);
    }
    return undefined;
  }, [
    setSearcherRef,
    findByOffsetLocal,
    findAllByHexLocal,
    findAllByAsciiTextLocal,
  ]);

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
            placeholder={t('searcher.placeholder', {
              type: searchType.toUpperCase(),
            })}
          />
          {searchType === 'ascii' && (
            <Tooltip
              text={
                ignoreCase
                  ? t('searcher.caseInsensitiveTooltip')
                  : t('searcher.caseSensitiveTooltip')
              }
            >
              <ButtonDiv
                onClick={() => setIgnoreCase((prev) => !prev)}
                style={{
                  opacity: ignoreCase ? 1 : 0.4,
                  fontWeight: ignoreCase ? 600 : 400,
                }}
              >
                {t('searcher.caseSensitiveToggle')}
              </ButtonDiv>
            </Tooltip>
          )}
          <Tooltip text={t('searcher.searchTooltip')}>
            <ButtonDiv
              onClick={() => inputValue && search(inputValue, searchType)}
            >
              <SearchIcon width={16} height={16} />
            </ButtonDiv>
          </Tooltip>
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
                    <Tooltip text={t('searcher.maxResultsTooltip')}>
                      <span
                        style={{
                          opacity: 0.6,
                          fontSize: '0.6rem',
                          marginLeft: '2px',
                        }}
                      >
                        {t('searcher.maxResults')}
                      </span>
                    </Tooltip>
                  )}
                </>
              ) : (
                <span>{t('searcher.foundOne')}</span>
              )}
            </Result>
            <NavigationButtons>
              <Tooltip text={t('searcher.prevTooltip')}>
                <ButtonDiv
                  onClick={handlePrevButtonClick}
                  $disabled={
                    (searchResults[activeKey] as SearchResult).results.length <=
                    1
                  }
                >
                  <ChevronLeftIcon width={16} height={16} />
                </ButtonDiv>
              </Tooltip>
              <Tooltip text={t('searcher.nextTooltip')}>
                <ButtonDiv
                  onClick={handleNextButtonClick}
                  $disabled={
                    (searchResults[activeKey] as SearchResult).results.length <=
                    1
                  }
                >
                  <ChevronRightIcon width={16} height={16} />
                </ButtonDiv>
              </Tooltip>
              <Tooltip text={t('searcher.resetTooltip')}>
                <ButtonDiv onClick={handleResetButtonClick}>
                  <XIcon height={16} width={16} />
                </ButtonDiv>
              </Tooltip>
            </NavigationButtons>
          </>
        ) : null}
      </SearchResultBar>
    </Collapse>
  );
};

export default React.memo(Searcher);
