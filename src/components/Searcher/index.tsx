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
  IndexBtn,
  Result,
  ResultDiv,
  SearchData,
  SearchDiv,
  SearchInput,
  SearchLabel,
  TextDiv,
} from './index.styles';
import { HexViewerRef, IndexInfo } from 'components/HexViewer';
import Tooltip from 'components/common/Tooltip';
import { TabKey } from 'types';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
  activeKey: TabKey;
}

interface SearchResult {
  results: IndexInfo[];
  currentIndex: number;
}

interface SearchState {
  [key: string]: SearchResult;
}

const initialState: SearchState = {};

type Action =
  | { type: 'SET_RESULTS'; key: TabKey; results: IndexInfo[] }
  | { type: 'SET_CURRENT_INDEX'; key: TabKey; index: number };

const reducer = (state: SearchState, action: Action): SearchState => {
  switch (action.type) {
    case 'SET_RESULTS':
      return {
        ...state,
        [action.key]: {
          results: action.results,
          currentIndex: action.results.length > 0 ? 0 : -1,
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
    default:
      return state;
  }
};

const filterInput = (inputValue: string, type: 'offset' | 'hex' | 'ascii') => {
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
  const [searchType, setSearchType] = useState<'offset' | 'hex' | 'ascii'>(
    'offset'
  );

  const search = useCallback(
    async (inputValue: string, type: 'offset' | 'hex' | 'ascii') => {
      if (!hexViewerRef.current) return;
      let results: IndexInfo[] = [];
      if (type === 'offset') {
        const res = await hexViewerRef.current.findByOffset(inputValue);
        results = res ? [res] : [];
      } else if (type === 'hex') {
        results = (await hexViewerRef.current.findAllByHex(inputValue)) || [];
      } else if (type === 'ascii') {
        results =
          (await hexViewerRef.current.findAllByAsciiText(inputValue)) || [];
      }
      dispatch({ type: 'SET_RESULTS', key: activeKey, results });
    },
    [hexViewerRef, activeKey]
  );

  const handleInputChange = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: 'offset' | 'hex' | 'ascii'
    ) => {
      const inputValue = filterInput(e.target.value, type);
      e.target.value = inputValue;
      if (!inputValue) return;
      setSearchType(type);
      if (type === 'offset') {
        await search(inputValue, type);
      }
    },
    [search]
  );

  const handleInputKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>, type: 'hex' | 'ascii') => {
      if (e.key === 'Enter') {
        const inputValue = filterInput(e.currentTarget.value, type);
        if (!inputValue) return;
        setSearchType(type);
        await search(inputValue, type);
      }
    },
    [search]
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

  return (
    <ContainerDiv>
      <Collapse title="Search" open>
        <SearchDiv>
          <SearchLabel>Offset</SearchLabel>
          <SearchData>
            <SearchInput
              onChange={(e) => handleInputChange(e, 'offset')}
              maxLength={8}
              onFocus={() => setSearchType('offset')}
            />
          </SearchData>
        </SearchDiv>
        <SearchDiv>
          <SearchLabel>Hex</SearchLabel>
          <SearchData>
            <Tooltip text="Enter시 검색">
              <SearchInput
                maxLength={8}
                onChange={(e) => handleInputChange(e, 'hex')}
                onFocus={() => setSearchType('hex')}
                onKeyDown={(e) => handleInputKeyPress(e, 'hex')}
              />
            </Tooltip>
          </SearchData>
        </SearchDiv>
        <SearchDiv>
          <SearchLabel>ASCII</SearchLabel>
          <SearchData>
            <Tooltip text="Enter시 검색">
              <SearchInput
                maxLength={50}
                onChange={(e) => handleInputChange(e, 'ascii')}
                onFocus={() => setSearchType('ascii')}
                onKeyDown={(e) => handleInputKeyPress(e, 'ascii')}
              />
            </Tooltip>
          </SearchData>
        </SearchDiv>
        {searchResults[activeKey]?.results.length > 0 && (
          <ResultDiv>
            <TextDiv>
              <Result>
                <Tooltip text="최대 1000개까지 검색">
                  총{' '}
                  <span style={{ color: 'var(--ice-main-color_1)' }}>
                    {searchResults[activeKey].results.length}
                  </span>
                  개의 결과
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
              </Result>
            </TextDiv>
            <ButtonDiv>
              <IndexBtn
                onClick={handlePrevButtonClick}
                $disabled={searchResults[activeKey].results.length <= 1}
              >
                PREV
              </IndexBtn>
              <IndexBtn
                onClick={handleNextButtonClick}
                $disabled={searchResults[activeKey].results.length <= 1}
              >
                NEXT
              </IndexBtn>
            </ButtonDiv>
          </ResultDiv>
        )}
      </Collapse>
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
