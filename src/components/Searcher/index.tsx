import Collapse from 'components/common/Collapse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ButtonDiv,
  ContainerDiv,
  IndexBtn,
  ResultDiv,
  SearchData,
  SearchDiv,
  SearchInput,
  SearchLabel,
} from './index.styles';
import { HexViewerRef, IndexInfo } from 'components/HexViewer';
import Tooltip from 'components/common/Tooltip';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const [results, setResults] = useState<IndexInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [searchType, setSearchType] = useState<'offset' | 'hex' | 'ascii'>(
    'offset'
  );

  const filterInput = (
    inputValue: string,
    type: 'offset' | 'hex' | 'ascii'
  ) => {
    if (type === 'ascii') return inputValue; // ASCII는 필터링하지 않음
    return inputValue.replace(/[^0-9a-fA-F]/g, '');
  };

  const search = useCallback(
    async (inputValue: string, type: 'offset' | 'hex' | 'ascii') => {
      if (!hexViewerRef.current) return;

      switch (type) {
        case 'offset': {
          const res = await hexViewerRef.current.findByOffset(inputValue);
          setResults(res ? [res] : []);
          break;
        }
        case 'hex': {
          const res = await hexViewerRef.current.findAllByHex(inputValue);
          setResults(res || []);
          break;
        }
        case 'ascii': {
          const res = await hexViewerRef.current.findAllByAsciiText(inputValue);
          setResults(res || []);
          break;
        }
      }
    },
    [hexViewerRef]
  );

  const handleInputChange = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: 'offset' | 'hex' | 'ascii'
    ) => {
      const inputValue = e.target.value;
      const filteredValue = filterInput(inputValue, type);
      e.target.value = filteredValue;
      if (!filteredValue) return;
      setSearchType(type);
      if (type === 'offset') {
        await search(filteredValue, type);
      }
    },
    [search]
  );

  const handleInputKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>, type: 'hex' | 'ascii') => {
      if (e.key === 'Enter') {
        const inputValue = e.currentTarget.value;
        const filteredValue = filterInput(inputValue, type);
        if (!filteredValue) return;
        setSearchType(type);
        await search(filteredValue, type);
      }
    },
    [search]
  );

  const handlePrevButtonClick = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : results.length - 1
    );
  }, [results.length]);

  const handleNextButtonClick = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex < results.length - 1 ? prevIndex + 1 : 0
    );
  }, [results.length]);

  const currentResult = useMemo(
    () => results[currentIndex],
    [results, currentIndex]
  );

  useEffect(() => {
    if (results.length > 0) setCurrentIndex(0);
    else setCurrentIndex(-1);
  }, [results]);

  useEffect(() => {
    if (currentIndex !== -1 && results.length > 0) {
      hexViewerRef.current?.scrollToIndex(
        currentResult?.index || 0,
        currentResult?.offset || 0
      );
    }
  }, [currentIndex, currentResult, hexViewerRef]);

  return (
    <ContainerDiv>
      <Collapse
        title="Search"
        children={
          <>
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
            <SearchDiv>
              <ResultDiv>
                {results.length === 0 && <div>검색 결과 없음</div>}
                {results.length > 0 && (
                  <>
                    총 {results.length}개의 결과 중 {currentIndex + 1}번째
                  </>
                )}
              </ResultDiv>
              <ButtonDiv>
                <IndexBtn
                  onClick={handlePrevButtonClick}
                  $disabled={currentIndex === -1}
                >
                  prev
                </IndexBtn>
                <IndexBtn
                  onClick={handleNextButtonClick}
                  $disabled={currentIndex === -1}
                >
                  next
                </IndexBtn>
              </ButtonDiv>
            </SearchDiv>
          </>
        }
        open
      />
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
