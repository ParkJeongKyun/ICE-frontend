import Collapse from 'components/common/Collapse';
import React, { Ref, useMemo } from 'react';
import {
  ContainerDiv,
  SearchDiv,
  SearchInput,
  SearchLabel,
} from './index.styles';
import { HexViewerRef } from 'components/HexViewer';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

const Searcher: React.FC<Props> = ({ hexViewerRef }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const hexRegex = /^[0-9a-fA-F]*$/; // 허용할 문자열 정규표현식

    // 입력값이 허용할 문자열 정규표현식과 일치하지 않으면 입력을 막습니다.
    if (!hexRegex.test(inputValue)) {
      e.preventDefault();
    } else {
      hexViewerRef.current?.scrollToRowByOffset(inputValue);
    }
  };

  return (
    <ContainerDiv>
      <Collapse
        title="Search"
        children={
          <>
            <SearchDiv>
              <SearchLabel>Offset</SearchLabel>
              <SearchInput onChange={handleInputChange} />
            </SearchDiv>
          </>
        }
        open
      />
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
