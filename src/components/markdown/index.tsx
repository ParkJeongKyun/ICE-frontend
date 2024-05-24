import React from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';

export interface Props {
  markdownText: string;
}

const ICEMarkDown: React.FC<Props> = ({ markdownText }) => {
  return (
    <>
      <MarkDownDiv>
        <Markdown>{markdownText}</Markdown>
      </MarkDownDiv>
    </>
  );
};

export default ICEMarkDown;

export const MarkDownDiv = styled.div`
  min-width: 400px;
  text-align: left;
`;
