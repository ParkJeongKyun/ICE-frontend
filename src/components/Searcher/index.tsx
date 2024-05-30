import Collapse from 'components/common/Collapse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const Searcher: React.FC<Props> = ({ hexViewerRef, activeKey }) => {
  const [searchResults, setSearchResults] = useState<{
    [key: TabKey]: SearchResult;
  }>({});
  const [searchType, setSearchType] = useState<'offset' | 'hex' | 'ascii'>(
    'offset'
  );

  const filterInput = (
    inputValue: string,
    type: 'offset' | 'hex' | 'ascii'
  ) => {
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
      setSearchResults((prev) => ({
        ...prev,
        [activeKey]: { results, currentIndex: results.length > 0 ? 0 : -1 },
      }));
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
    setSearchResults((prev) => {
      const currentIndex = prev[activeKey].currentIndex;
      const newIndex =
        currentIndex > 0
          ? currentIndex - 1
          : prev[activeKey].results.length - 1;
      return {
        ...prev,
        [activeKey]: { ...prev[activeKey], currentIndex: newIndex },
      };
    });
  }, [activeKey]);

  const handleNextButtonClick = useCallback(() => {
    setSearchResults((prev) => {
      const currentIndex = prev[activeKey].currentIndex;
      const newIndex =
        currentIndex < prev[activeKey].results.length - 1
          ? currentIndex + 1
          : 0;
      return {
        ...prev,
        [activeKey]: { ...prev[activeKey], currentIndex: newIndex },
      };
    });
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
