import React from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';

export interface Props {
  markdownText: string;
}

// 링크 랜더링 커스텀
interface LinkRendererProps {
  href?: string;
  children?: React.ReactNode;
}

// 이미지 랜더링 커스텀
interface ImageRendererProps {
  src?: string;
  alt?: string;
}

const ICEMarkDown: React.FC<Props> = ({ markdownText }) => {
  const ImageRenderer: React.FC<ImageRendererProps> = ({ src, alt }) => {
    return <img src={src} alt={alt} />;
  };

  const LinkRenderer: React.FC<LinkRendererProps> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );

  const components = {
    // LinkRenderer를 JSX 요소로 사용할 수 있는 타입으로 명시적으로 지정
    a: (props: LinkRendererProps) => <LinkRenderer {...props} />,
    img: (props: ImageRendererProps) => <ImageRenderer {...props} />,
  };

  return (
    <MarkdownContainer>
      <MarkDownDiv>
        <Markdown components={components}>{markdownText}</Markdown>
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

  img {
    max-width: 100%;
    border: 1px solid var(--main-line-color);
  }
`;
