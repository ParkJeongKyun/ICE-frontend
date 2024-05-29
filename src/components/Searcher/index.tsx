import Collapse from 'components/common/Collapse';
import React from 'react';
import {
  ContainerDiv,
  SearchData,
  SearchDiv,
  SearchInput,
  SearchLabel,
} from './index.styles';
import { HexViewerRef } from 'components/HexViewer';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const filterInput = (inputValue: string) => {
    const hexRegex = /^[0-9a-fA-F]*$/;
    return inputValue.replace(new RegExp(`[^${hexRegex.source}]`, 'g'), '');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = filterInput(e.target.value);
    await hexViewerRef.current?.findByOffset(inputValue).then((res) => {
      console.log(res);
      if (res) hexViewerRef.current?.scrollToIndex(res.index, res.offset);
    });
  };

  const handleInputChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = filterInput(e.target.value);
    await hexViewerRef.current?.findAllByHex(inputValue).then((res) => {
      console.log(res);
      if (res && res.length > 0)
        hexViewerRef.current?.scrollToIndex(res[0].index, res[0].offset);
    });
  };

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
          </>
        }
        open
      />
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
