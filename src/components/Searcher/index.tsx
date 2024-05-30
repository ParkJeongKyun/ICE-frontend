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
    let filteredInput: string;
    switch (type) {
      case 'offset': {
        filteredInput = inputValue.replace(/[^0-9a-fA-F]/g, '');
        break;
      }
      case 'hex': {
        filteredInput = inputValue.replace(/[^0-9a-fA-F]/g, '');
        break;
      }
      case 'ascii': {
        filteredInput = inputValue.replace(/[^\x00-\x7F]/g, '');
        break;
      }
    }

    return filteredInput;
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
            {results.length > 0 && (
              <ResultDiv>
                <TextDiv>
                  <Result>
                    <>
                      <Tooltip text="최대 1000개까지 검색">
                        총{' '}
                        <span style={{ color: 'var(--ice-main-color_1)' }}>
                          {results.length}
                        </span>
                        개의 결과 중{' '}
                        <span style={{ color: 'var(--ice-main-color)' }}>
                          {currentIndex + 1}
                        </span>
                        번째
                      </Tooltip>
                    </>
                  </Result>
                </TextDiv>
                <ButtonDiv>
                  <IndexBtn
                    onClick={handlePrevButtonClick}
                    $disabled={currentIndex === -1 || results.length === 1}
                  >
                    PREV
                  </IndexBtn>
                  <IndexBtn
                    onClick={handleNextButtonClick}
                    $disabled={currentIndex === -1 || results.length === 1}
                  >
                    NEXT
                  </IndexBtn>
                </ButtonDiv>
              </ResultDiv>
            )}
          </>
        }
        open
      />
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
