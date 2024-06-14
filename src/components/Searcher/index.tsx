import Collapse from 'components/common/Collapse';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {
  ButtonDiv,
  ContainerDiv,
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
} from './index.styles';
import { HexViewerRef, IndexInfo } from 'components/HexViewer';
import Tooltip from 'components/common/Tooltip';
import { TabKey } from 'types';
import XIcon from 'components/common/Icons/XIcon';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
  activeKey: TabKey;
}

type TSearchType = 'offset' | 'hex' | 'ascii';

interface SearchResult {
  results: IndexInfo[];
  currentIndex: number;
  inputValue: string;
  searchType: TSearchType;
}

interface SearchState {
  [key: string]: SearchResult;
}

const initialState: SearchState = {};

type Action =
  | {
      type: 'SET_RESULTS';
      key: TabKey;
      results: IndexInfo[];
      inputValue: string;
      searchType: TSearchType;
    }
  | { type: 'SET_CURRENT_INDEX'; key: TabKey; index: number }
  | { type: 'RESET_RESULTS' };

const reducer = (state: SearchState, action: Action): SearchState => {
  switch (action.type) {
    case 'SET_RESULTS':
      return {
        ...state,
        [action.key]: {
          results: action.results,
          currentIndex: action.results.length > 0 ? 0 : -1,
          inputValue: action.inputValue,
          searchType: action.searchType,
        },
      };
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          currentIndex: action.index,
        },
      };
    case 'RESET_RESULTS':
      return initialState;
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

const Searcher: React.FC<Props> = ({ hexViewerRef, activeKey }) => {
  const [searchResults, dispatch] = useReducer(reducer, initialState);
  const [searchType, setSearchType] = useState<TSearchType>('offset');
  const [inputValue, setInputValue] = useState('');

  const search = useCallback(
    async (inputValue: string, type: TSearchType) => {
      if (!hexViewerRef.current) return;
      let results: IndexInfo[] = [];
      if (type === 'offset') {
        const res = await hexViewerRef.current.findByOffset(inputValue);
        results = res ? [res] : [];
      } else if (type === 'hex') {
        results = (await hexViewerRef.current.findAllByHex(inputValue)) || [];
      } else if (type === 'ascii') {
        results =
          (await hexViewerRef.current.findAllByAsciiText(inputValue, true)) ||
          [];
      }
      dispatch({
        type: 'SET_RESULTS',
        key: activeKey,
        results,
        inputValue,
        searchType,
      });
    },
    [hexViewerRef, activeKey]
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
    dispatch({
      type: 'SET_CURRENT_INDEX',
      key: activeKey,
      index:
        searchResults[activeKey].currentIndex > 0
          ? searchResults[activeKey].currentIndex - 1
          : searchResults[activeKey].results.length - 1,
    });
  }, [activeKey, searchResults]);

  const handleNextButtonClick = useCallback(() => {
    dispatch({
      type: 'SET_CURRENT_INDEX',
      key: activeKey,
      index:
        searchResults[activeKey].currentIndex <
        searchResults[activeKey].results.length - 1
          ? searchResults[activeKey].currentIndex + 1
          : 0,
    });
  }, [activeKey, searchResults]);

  const handleResetButtonClick = useCallback(() => {
    dispatch({ type: 'RESET_RESULTS' });
    setInputValue('');
  }, [activeKey]);

  const currentResult = useMemo(() => {
    return (
      searchResults[activeKey]?.results[
        searchResults[activeKey]?.currentIndex
      ] || null
    );
  }, [searchResults, activeKey]);

  useEffect(() => {
    if (currentResult) {
      hexViewerRef.current?.scrollToIndex(
        currentResult.index,
        currentResult.offset
      );
    }
  }, [currentResult, hexViewerRef]);

  useEffect(() => {
    if (
      (inputValue && inputValue != searchResults[activeKey]?.inputValue) ||
      searchType != searchResults[activeKey]?.searchType
    )
      search(inputValue, searchType);
  }, [activeKey, search]);

  useEffect(() => {
    setInputValue('');
  }, [searchType]);

  return (
    <ContainerDiv>
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
          <SearchData>
            <Tooltip text="엔터시 검색">
              <SearchInput
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyPress}
                maxLength={searchType === 'offset' ? 8 : 50}
                placeholder={`${searchType} 값을 입력하세요.`}
              />
            </Tooltip>
          </SearchData>
        </SearchDiv>
        {searchResults[activeKey]?.results.length > 0 && (
          <ResultDiv>
            <TextDiv>
              <Result>
                <div>
                  <Tooltip text="최대 1000개까지 검색 가능">
                    총{' '}
                    <span style={{ color: 'var(--ice-main-color_1)' }}>
                      {searchResults[activeKey].results.length}
                    </span>
                    개의 결과{' '}
                    {searchResults[activeKey].results.length > 1 && (
                      <>
                        중{' '}
                        <span style={{ color: 'var(--ice-main-color)' }}>
                          {searchResults[activeKey].currentIndex + 1}
                        </span>
                        번째
                      </>
                    )}
                  </Tooltip>
                </div>
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
                $disabled={searchResults[activeKey].results.length <= 1}
              >
                PREV
              </SearchBtn>
              <SearchBtn
                onClick={handleNextButtonClick}
                $disabled={searchResults[activeKey].results.length <= 1}
              >
                NEXT
              </SearchBtn>
            </ButtonDiv>
          </ResultDiv>
        )}
      </Collapse>
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
