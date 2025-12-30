import styled, { keyframes } from 'styled-components';

// Hero 섹션 전체 화면
export const HeroSection = styled.section`
  height: 100dvh;
  max-width: 100vw;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 어두운 gradient 애니메이션 배경
const gradientMove = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

export const AnimatedBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(120deg, #232526 0%, #414345 40%, #191654 100%);
  background-size: 200% 200%;
  animation: ${gradientMove} 10s ease-in-out infinite;
  opacity: 0.7;
  filter: blur(2px);
  pointer-events: none;
`;

// 전체 배경 및 폰트
export const MainContainer = styled.div`
  min-height: 100vh;
  background: #181a20;
  color: #e6e8ef;
  overflow-x: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

// 앱 컨테이너
export const AppContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
  background: none;
  overflow-x: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

// 각 섹션 블록(구분선, 패딩)
export const SectionBlock = styled.section`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2.5rem 1.2rem 1.5rem 1.2rem;
  border-bottom: 1px solid rgba(120, 130, 180, 0.08);
  box-sizing: border-box;
  word-break: break-word;
  overflow-wrap: anywhere;
  text-align: left;

  &:last-child {
    border-bottom: none;
    padding-bottom: 2.5rem;
  }
`;

// 카드 역할 없음, 최소화
export const SimpleListCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

// 제목: 좌측 정렬, 여백
export const SectionTitle = styled.h2`
  font-size: 1.08rem;
  font-weight: 700;
  margin: 0 0 0.7rem 0;
  color: #a5b4fc;
  text-align: left;
  letter-spacing: -0.01em;
`;

// 리스트: gap, 패딩, 여백 조정
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
`;

// 리스트 아이템: line-height, 패딩, 여백
export const ListItem = styled.li`
  padding: 0.22rem 0 0.22rem 0.1rem;
  font-size: 1.01rem;
  color: #e6e8ef;
  background: none;
  display: flex;
  align-items: flex-start;
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: anywhere;

  strong {
    color: #a5b4fc;
    font-weight: 600;
    margin-right: 0.3em;
    font-size: 1em;
    letter-spacing: -0.01em;
  }
`;

// 소제목 (사용 안함)
export const SubTitle = styled.h3`
  display: none;
`;

// 스크롤 인디케이터
export const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.85;
  font-size: 0.92rem;
  pointer-events: none;
  user-select: none;
  z-index: 2;

  .arrow {
    width: 26px;
    height: 26px;
    margin-top: 4px;
    display: block;
    animation: bounceDown 1.6s infinite;
    stroke: #a5b4fc;
    filter: drop-shadow(0 0 4px #7f53ac88);
  }

  @keyframes bounceDown {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(14px);
    }
  }
`;

// SectionCard는 더 이상 사용하지 않으므로 빈 div로 유지
export const SectionCard = styled.div``;
