import Collapse from 'components/common/Collapse';
import React from 'react';
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
    const hexRegex = /^[0-9a-fA-F]*$/;

    const filteredValue = inputValue
      .split('') // 문자열을 배열로 변환
      .filter((char) => hexRegex.test(char)) // 정규표현식과 일치하는 문자만 필터링
      .join(''); // 배열을 문자열로 다시 결합

    // 필터링된 문자열을 입력값으로 설정합니다.
    e.target.value = filteredValue;

    // HexViewerRef로 스크롤 처리 등 추가 작업 수행 가능
    hexViewerRef.current?.scrollToRowByOffset(filteredValue);
  };

  return (
    <ContainerDiv>
      <Collapse
        title="Search"
        children={
          <>
            <SearchDiv>
              <SearchLabel>Offset</SearchLabel>
              <SearchInput
                onChange={handleInputChange}
                maxLength={8}
                onFocus={handleInputChange}
              />
            </SearchDiv>
          </>
        }
        open
      />
    </ContainerDiv>
  );
};

export default React.memo(Searcher);
