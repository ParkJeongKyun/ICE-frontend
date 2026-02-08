'use client';

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';
import BackArrowIcon from '@/components/common/Icons/BackArrowIcon';
import { useTranslations } from 'next-intl';

export interface Props {
  defaultText: string;
  childTexts?: { [key: string]: string };
}

const ICEMarkDown: React.FC<Props> = ({ defaultText, childTexts }) => {
  const t = useTranslations();
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

  // 이미지 태그 커스텀 랜더링 (react-markdown v7+ 호환)
  const ImageRenderer: React.FC<React.ComponentProps<'img'>> = (props) => {
    return <img {...props} />;
  };

  // 링크 태그 커스텀 랜더링 (react-markdown v7+ 호환)
  const LinkRenderer: React.FC<React.ComponentProps<'a'>> = (props) => {
    const { href, children, ...rest } = props;
    return href?.startsWith('/markdown/') ? (
      <MarkDownLink
        onClick={() => {
          setChildText(href.split('/markdown/')[1] || '');
        }}
      >
        {children}
      </MarkDownLink>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  };

  // 커스텀 컴포넌트
  const components = {
    a: LinkRenderer,
    img: ImageRenderer,
  };

  return (
    <MarkdownContainer>
      <MarkDownDiv>
        <Markdown components={components}>{markdownText}</Markdown>
      </MarkDownDiv>
      {markdownText != defaultText && (
        <FloatingBackBtn onClick={setDefaultText} aria-label={t('common.back')}>
          <BackArrowIcon
            width={18}
            height={18}
            color="var(--ice-main-color_3)"
          />
        </FloatingBackBtn>
      )}
    </MarkdownContainer>
  );
};

export default ICEMarkDown;

// 메인 컨테이너
const MarkdownContainer = styled.div`
  position: relative; /* floating button 기준 */
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  text-align: left;
  height: 100%;
`;

// 떠 있는 뒤로가기 버튼 (우측 상단)
const FloatingBackBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  color: var(--main-color);
  border-radius: 3px;
  cursor: pointer;
  z-index: 30;
  opacity: 0.8;
  transition: opacity 0.12s ease;

  &:hover {
    opacity: 1;
  }
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
  line-height: 1.5;

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
