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

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const [results, setResults] = useState<IndexInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [searchType, setSearchType] = useState<'offset' | 'hex' | 'ascii'>(
    'offset'
  );

  const filterInput = (inputValue: string) => {
    const hexRegex = /^[0-9a-fA-F]*$/;
    return inputValue.replace(new RegExp(`[^${hexRegex.source}]`, 'g'), '');
  };

  const searchByOffset = useCallback(
    async (inputValue: string) => {
      const res = await hexViewerRef.current?.findByOffset(inputValue);
      if (res) setResults([res]);
      else setResults([]);
    },
    [hexViewerRef]
  );

  const searchByHex = useCallback(
    async (inputValue: string) => {
      const res = await hexViewerRef.current?.findAllByHex(inputValue);
      setResults(res || []);
    },
    [hexViewerRef]
  );

  const searchByAscii = useCallback(
    async (inputValue: string) => {
      const res = await hexViewerRef.current?.findAllByAsciiText(inputValue);
      setResults(res || []);
    },
    [hexViewerRef]
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = filterInput(e.target.value);
      setSearchType('offset');
      await searchByOffset(inputValue);
    },
    [searchByOffset]
  );

  const handleInputChange2 = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = filterInput(e.target.value);
      setSearchType('hex');
      await searchByHex(inputValue);
    },
    [searchByHex]
  );
  const handleInputChange3 = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = filterInput(e.target.value);
      setSearchType('ascii');
      await searchByAscii(inputValue);
    },
    [searchByAscii]
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
                  onChange={handleInputChange}
                  maxLength={8}
                  onFocus={handleInputChange}
                />
              </SearchData>
            </SearchDiv>
            <SearchDiv>
              <SearchLabel>Hex</SearchLabel>
              <SearchData>
                <SearchInput
                  maxLength={8}
                  onBlur={handleInputChange2}
                  onFocus={() => setSearchType('hex')}
                />
              </SearchData>
            </SearchDiv>
            <SearchDiv>
              <SearchLabel>ASCII</SearchLabel>
              <SearchData>
                <SearchInput
                  maxLength={8}
                  onBlur={handleInputChange3}
                  onFocus={() => setSearchType('ascii')}
                />
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
