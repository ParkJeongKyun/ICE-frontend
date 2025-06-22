import React, { useState } from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';
import BackArrowIcon from '@/components/common/Icons/BackArrowIcon';

export interface Props {
  defaultText: string;
  childTexts?: { [key: string]: string };
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

const ICEMarkDown: React.FC<Props> = ({ defaultText, childTexts }) => {
  const [markdownText, setMarkdownText] = useState<string>(defaultText);

  // 기본 텍스트로 변경
  const setDefaultText = () => {
    setMarkdownText(defaultText);
  };

  // 자식 텍스트로 변경
  const setChildText = (key: string) => {
    if (key && childTexts && childTexts[key]) {
      setMarkdownText(childTexts[key]);
    }
  };

  // 이미지 태그 커스텀 랜더링
  const ImageRenderer: React.FC<ImageRendererProps> = ({ src, alt }) => {
    return <img src={src} alt={alt} />;
  };

  // 링크 태그 커스텀 랜더링
  const LinkRenderer: React.FC<LinkRendererProps> = ({ href, children }) => {
    // 마크다운 링크
    return href?.startsWith('/markdown/') ? (
      <MarkDownLink
        onClick={() => {
          setChildText(href.split('/markdown/')[1] || '');
        }}
      >
        {children}
      </MarkDownLink>
    ) : (
      // 실제 링크
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  };

  // 커스텀 컴포넌트
  const components = {
    // 링크
    a: (props: LinkRendererProps) => <LinkRenderer {...props} />,
    // 이미지
    img: (props: ImageRendererProps) => <ImageRenderer {...props} />,
  };

  return (
    <MarkdownContainer>
      {/* 기본 텍스트로 변경 */}
      {markdownText != defaultText && (
        <MarkdownHeader>
          <SetDefaultBtn onClick={setDefaultText}>
            <BackArrowIcon
              width={22}
              height={22}
              color="var(--ice-main-color_3)"
            />
          </SetDefaultBtn>
        </MarkdownHeader>
      )}
      <MarkDownDiv>
        <Markdown components={components}>{markdownText}</Markdown>
      </MarkDownDiv>
    </MarkdownContainer>
  );
};

export default ICEMarkDown;

// 메인 컨테이너
const MarkdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  text-align: left;
  height: 100%;
`;

const MarkdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0px 5px;
  border-bottom: 1.5px solid var(--main-line-color);
`;

// 기본 텍스트로 변경 버튼
const SetDefaultBtn = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 마크다운 링크
const MarkDownLink = styled.span`
  color: var(--ice-main-color);
  text-decoration: underline;
  cursor: pointer;
`;

// 마크다운 컨테이너
export const MarkDownDiv = styled.div`
  overflow-y: auto;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 15px;
  font-size: 0.75rem;
  line-height: 1.6;

  /* Styling for headings */
  h1 {
    font-size: 1.125rem;
    border-bottom: 1.5px solid var(--main-line-color);
  }

  h2 {
    font-size: 1rem;
    border-bottom: 1.5px solid var(--main-line-color);
  }

  h3 {
    font-size: 0.8rem;
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
