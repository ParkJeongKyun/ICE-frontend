import React from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';

export interface Props {
  markdownText: string;
}

const ICEMarkDown: React.FC<Props> = ({ markdownText }) => {
  return (
    <MarkdownContainer>
      <MarkDownDiv>
        <Markdown>{markdownText}</Markdown>
      </MarkDownDiv>
    </MarkdownContainer>
  );
};

export default ICEMarkDown;

const MarkdownContainer = styled.div`
  overflow-y: auto;
  text-align: left;
  padding: 10px;
  margin: 0 auto;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  height: 50vh;
  max-height: 500px;
`;

export const MarkDownDiv = styled.div`
  font-size: 12px;
  line-height: 1.6;

  /* Styling for headings */
  h1 {
    font-size: 18px;
    margin-top: 10px;
    border-bottom: 1.5px solid var(--main-line-color);
  }

  h2 {
    font-size: 16px;
    margin-top: 10px;
    border-bottom: 1.5px solid var(--main-line-color);
  }

  h3 {
    font-size: 14px;
    margin-top: 10px;
    border-bottom: 1.5px solid var(--main-line-color);
  }

  /* Styling for links */
  a {
    color: var(--ice-main-color);
    text-decoration: underline;
  }

  /* Styling for code blocks */
  pre {
    background-color: var(--main-hover-color);
    padding: 5px;
    border-radius: 5px;
    overflow-x: auto;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
  }

  /* Styling for lists */
  ul,
  ol {
    padding-left: 20px;
    margin-left: 2px;
    margin-bottom: 5px;
  }
`;
