import Collapse from 'components/common/Collapse';
import React, { useEffect, useState } from 'react';
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

  const filterInput = (inputValue: string) => {
    const hexRegex = /^[0-9a-fA-F]*$/;
    return inputValue.replace(new RegExp(`[^${hexRegex.source}]`, 'g'), '');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = filterInput(e.target.value);
    await searchByOffset(inputValue);
  };

  const handleInputChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = filterInput(e.target.value);
    await searchByHex(inputValue);
  };

  const searchByOffset = async (inputValue: string) => {
    const res = await hexViewerRef.current?.findByOffset(inputValue);
    if (res) setResults([res]);
    else setResults([]);
  };

  const searchByHex = async (inputValue: string) => {
    const res = await hexViewerRef.current?.findAllByHex(inputValue);
    setResults(res || []);
  };

  const handlePrevButtonClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextButtonClick = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(-1);
    }
  }, [results]);

  useEffect(() => {
    if (currentIndex !== -1 && results.length > 0) {
      hexViewerRef.current?.scrollToIndex(
        results[currentIndex].index,
        results[currentIndex].offset
      );
    }
  }, [currentIndex]);

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
                <SearchInput maxLength={8} onBlur={handleInputChange2} />
              </SearchData>
            </SearchDiv>
            <SearchDiv>
              <ResultDiv>
                {results.length}개의 결과 중 {currentIndex}번째
              </ResultDiv>
              <ButtonDiv>
                <IndexBtn
                  onClick={handlePrevButtonClick}
                  $display={currentIndex === 0 || currentIndex === -1}
                >
                  Prev
                </IndexBtn>
                <IndexBtn
                  onClick={handleNextButtonClick}
                  $display={
                    currentIndex === results.length - 1 || currentIndex === -1
                  }
                >
                  Next
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
