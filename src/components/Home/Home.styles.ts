import styled from 'styled-components';
import Link from 'next/link';

export const HomeDiv = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  background-color: var(--main-bg-color);

  @media (max-width: 1024px) {
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
    display: block; /* 스크롤 안정성을 위해 block으로 변경 */
  }
`;

export const LeftSection = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 0 2rem;
  border-right: 1.5px solid var(--main-line-color);
  flex-shrink: 0;
  overflow-y: auto;

  @media (max-width: 1024px) {
    width: 100%;
    height: auto;
    overflow-y: visible;
    padding: 3rem 1rem; /* 패딩 축소 */
    border-right: none;
    border-bottom: 1.5px solid var(--main-line-color);
    box-sizing: border-box; /* 패딩이 너비에 포함되도록 강제 */
  }
`;

export const RightSection = styled.div`
  flex: 6;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1024px) {
    width: 100%;
    height: auto;
    overflow-y: visible;
    padding: 3rem 1rem; /* 패딩 축소 */
    box-sizing: border-box;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
  padding: 4rem 0;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    min-height: auto;
    padding: 1rem 0;
  }
`;

export const ContientDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 450px;
  text-align: left;
  gap: 1.25rem;
  margin: auto 0;

  @media (max-width: 1024px) {
    margin: 0;
    max-width: 100%; /* 모바일에서 고정 너비 해제 */
  }
`;

// --- [이하 원본 디자인 스타일 유지] ---
export const TitleDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  display: flex;
  align-items: baseline;
  font-size: 2.75rem;
  font-weight: 600;
  color: var(--ice-main-color);

  @media (max-width: 480px) {
    font-size: 2.25rem;
  }
`;

export const Version = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--main-color-reverse);
  margin-left: 0.5rem;
`;

export const SubTitleDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.5rem 1rem;
  padding-left: 1rem;
  gap: 0.1rem;
  border-left: 2px solid var(--ice-main-color);
  opacity: 0.8;
`;

export const SubTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--main-color);
`;

export const StartDiv = styled.div`
  margin: 0.5rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ice-main-color-warning);
`;

export const Btn = styled.div`
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  font-size: 1rem;
  color: var(--ice-main-color);
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    color: var(--main-hover-line-color);
  }
`;

export const InfoDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--main-color);
  margin: 1rem;
  opacity: 0.7;

  > div:last-child {
    padding-top: 1rem;
    color: var(--main-color-reverse);
    opacity: 1;
  }
`;

export const PrivacyLink = styled(Link)`
  color: var(--ice-main-color);
  text-decoration: underline;
  cursor: pointer;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ice-main-color);
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 3px solid var(--ice-main-color);
  /* 긴 제목 대응 */
  word-break: break-word;
`;

export const ListText = styled.div`
  font-size: 1rem;
  color: var(--main-color);
  margin-bottom: 0.25rem;
  margin-left: 1.25rem;
  margin-right: 1.25rem;
  line-height: 1.6;
  /* 텍스트 줄바꿈 강제 */
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const FaqBox = styled.div`
  margin-bottom: 2.5rem;
  width: 100%;
  box-sizing: border-box;

  .q {
    font-weight: 700;
    color: var(--main-color);
    margin-bottom: 0.5rem;
    line-height: 1.4;
    /* 질문 짤림 방지 */
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .a {
    font-size: 0.95rem;
    margin-left: 1.25rem;
    color: var(--main-color-reverse);
    line-height: 1.7;
    /* 답변 짤림 방지 핵심 */
    word-break: break-word;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
`;

export const PreviewBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 2.5px;
  overflow: hidden;
  border: 1px solid var(--main-line-color);
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.9;
  }
`;
