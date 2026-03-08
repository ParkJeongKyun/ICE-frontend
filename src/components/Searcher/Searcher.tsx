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
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import eventBus from '@/types/eventBus';
import { useSearch } from './hooks/useSearch';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import type {
  SearchType,
  SearchCacheKey,
  SearchResult,
} from '@/types/searcher';
import { initialSearchState, searchReducer } from './hooks/useSearchReducer';

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

const Searcher: React.FC = () => {
  const t = useTranslations();
  const { hexViewerRef, setSearcherRef } = useRefs();
  const { activeKey } = useTab();
  const { isAnalysisProcessing } = useProcess();
  const [searchResults, dispatch] = useReducer(
    searchReducer,
    initialSearchState
  );
  const [searchType, setSearchType] = useState<SearchType>('hex');
  const [inputValue, setInputValue] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const searchTabKeyRef = useRef<TabKey>(activeKey);

  const {
    findByOffset,
    findAllByHex,
    findAllByAsciiText,
    filterInput,
    cancelSearch,
  } = useSearch();

  // Exposed imperative methods (extracted so they can be registered into context)
  const findByOffsetLocal = React.useCallback(
    async (offset: string, length: number = 1, shouldScroll = true) => {
      if (!offset.trim()) {
        eventBus.emit('toast', { code: 'SEARCH_NO_INPUT' });
        return null;
      }

      const result = await findByOffset(offset, length);

      if (result === null) {
        const byteOffset = parseInt(offset, 16);
        if (isNaN(byteOffset)) {
          eventBus.emit('toast', { code: 'SEARCH_INVALID_HEX' });
        } else {
          eventBus.emit('toast', { code: 'SEARCH_OFFSET_OUT_OF_RANGE' });
        }
        return null;
      }

      if (shouldScroll && hexViewerRef.current) {
        hexViewerRef.current.scrollToIndex(result.index, result.offset);
      }
      return result;
    },
    [findByOffset, hexViewerRef]
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
      if (!hexViewerRef.current || isAnalysisProcessing) return;

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

        // 캐시 HIT 시에만 토스트 (WorkerContext에서는 이미 처리되었음)
        if (cachedResults.length > 0) {
          eventBus.emit('toast', {
            code: 'SEARCH_SUCCESS',
            message: t('searcher.success', {
              count: cachedResults.length,
            }),
          });
        } else {
          eventBus.emit('toast', { code: 'SEARCH_NO_RESULTS' });
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

      // 캐시 MISS: 컴포넌트에서 결과 처리 및 토스트 emit
      try {
        let searchResult = null;
        if (type === 'hex') {
          searchResult = await findAllByHex(inputValue);
        } else if (type === 'ascii') {
          searchResult = await findAllByAsciiText(inputValue, ignoreCase);
        }

        const results = searchResult?.data.indices || [];

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

          if (searchResult === null) {
            return;
          }

          if (results.length > 0) {
            eventBus.emit('toast', {
              code: 'SEARCH_SUCCESS',
              message: t('searcher.success', {
                count: results.length,
              }),
              stats: searchResult.stats,
            });
          } else {
            eventBus.emit('toast', {
              code: 'SEARCH_NO_RESULTS',
              stats: searchResult.stats,
            });
          }

          if (shouldScroll && results.length > 0 && hexViewerRef.current) {
            hexViewerRef.current.scrollToIndex(
              results[0].index,
              results[0].offset
            );
          }
        }
      } catch (error) {
        // 취소된 경우 조기 return (캐시 저장 안함)
        if (error instanceof Error && error.message === 'SEARCH_CANCELLED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Searcher] Search cancelled by user');
          }
          return;
        }
        // 기타 에러는 로그만 남김
        console.error('[Searcher] Search failed:', error);
      }
    },
    [
      activeKey,
      ignoreCase,
      isAnalysisProcessing,
      getCacheKey,
      searchResults.__cache__,
      findAllByHex,
      findAllByAsciiText,
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
      if (e.key === 'Enter' && inputValue && !isAnalysisProcessing) {
        await search(inputValue, searchType);
      }
    },
    [inputValue, isAnalysisProcessing, search, searchType]
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

  return (
    <Collapse title={t('searcher.title')} open>
      <SearchDiv>
        <SearchLabel>{t('searcher.typeLabel')}</SearchLabel>
        <SearchData>
          <SearchSelect
            value={searchType}
            onChange={handleSearchTypeChange}
            disabled={isAnalysisProcessing}
            aria-label={t('searcher.typeLabel')}
          >
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
            disabled={isAnalysisProcessing}
            aria-label={t('searcher.searchLabel')}
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
                onClick={() =>
                  !isAnalysisProcessing && setIgnoreCase((prev) => !prev)
                }
                $disabled={isAnalysisProcessing}
                aria-label={
                  ignoreCase
                    ? t('searcher.caseInsensitiveTooltip')
                    : t('searcher.caseSensitiveTooltip')
                }
                style={{
                  opacity: ignoreCase ? 1 : 0.4,
                  fontWeight: ignoreCase ? 600 : 400,
                }}
              >
                {t('searcher.caseSensitiveToggle')}
              </ButtonDiv>
            </Tooltip>
          )}
          {isAnalysisProcessing ? (
            <Tooltip text={t('searcher.cancelTooltip')}>
              <ButtonDiv
                onClick={cancelSearch}
                aria-label={t('searcher.cancelTooltip')}
              >
                <XIcon width={16} height={16} />
              </ButtonDiv>
            </Tooltip>
          ) : (
            <Tooltip text={t('searcher.searchTooltip')}>
              <ButtonDiv
                onClick={() =>
                  !isAnalysisProcessing &&
                  inputValue &&
                  search(inputValue, searchType)
                }
                $disabled={isAnalysisProcessing || !inputValue}
                aria-label={t('searcher.searchTooltip')}
              >
                <SearchIcon width={16} height={16} />
              </ButtonDiv>
            </Tooltip>
          )}
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
                  aria-label={t('searcher.prevTooltip')}
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
                  aria-label={t('searcher.nextTooltip')}
                  $disabled={
                    (searchResults[activeKey] as SearchResult).results.length <=
                    1
                  }
                >
                  <ChevronRightIcon width={16} height={16} />
                </ButtonDiv>
              </Tooltip>
              <Tooltip text={t('searcher.resetTooltip')}>
                <ButtonDiv
                  onClick={handleResetButtonClick}
                  aria-label={t('searcher.resetTooltip')}
                >
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
