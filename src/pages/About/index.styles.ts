import styled from 'styled-components';

// 전체 배경 및 폰트
export const MainContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    var(--main-bg-color) 0%,
    var(--main-hover-color) 100%
  );
  color: var(--main-color);
`;

export const AppContainer = styled.div`
  font-family: 'Pretendard', sans-serif;
  text-align: left;
  width: 100%;
  margin: 0 auto;
  padding: 0;
`;

// 심플 카드
export const SectionCard = styled.div`
  max-width: 500px;
  margin: 1rem auto;
  padding: 1rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(102, 126, 234, 0.04);
  box-sizing: border-box;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

// 제목
export const SectionTitle = styled.h2`
  font-size: 1.08rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// 리스트
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
`;

// 리스트 아이템
export const ListItem = styled.li`
  padding: 0.28rem 0.5rem;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.04);
  transition: background 0.2s;
  font-size: 0.97rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.32;

  &:hover {
    background: rgba(102, 126, 234, 0.09);
  }

  strong {
    color: #667eea;
    font-weight: 600;
    margin-right: 0.3em;
    font-size: 1em;
  }
`;

// 소제목
export const SubTitle = styled.h3`
  margin-top: 0.8rem;
  font-size: 0.97rem;
  font-weight: 600;
  color: #764ba2;
  margin-bottom: 0.25rem;
`;

// 스크롤 인디케이터
export const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.7;
  font-size: 0.92rem;
  pointer-events: none;
  user-select: none;

  .arrow {
    width: 18px;
    height: 18px;
    margin-top: 4px;
    display: block;
    animation: bounceDown 1.6s infinite;
    stroke: #667eea;
  }

  @keyframes bounceDown {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(8px);
    }
  }
`;
