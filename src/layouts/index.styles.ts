import { Image, Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import styled from 'styled-components';

// 메인 레이아웃
export const IceMainLayout = styled(Layout)`
  height: 100vh;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border-color: var(--main-line-color);
  border: none;
  overflow: hidden; /* 스크롤 숨기기 */
`;

export const LogoImage = styled(Image)`
  max-height: 18px;
  min-height: 18px;
  /* padding-top: 1px; */
  /* padding-right: 5px; */
`;

// 헤더
export const IceHeader = styled(Header)`
  display: flex;
  gap: 5px;
  /* 위 | 오른쪽 | 아래 | 왼쪽 */
  margin: 0 5px 0 5px;
  padding: 0 5px 0 5px;

  height: 27px;
  line-height: 15px;

  background-color: var(--main-bg-color);
  color: var(--main-color);

  border-bottom: 1px solid var(--main-line-color);
`;

// 푸터
export const IceFooter = styled(Footer)`
  height: 24px; /* 기본 푸터 높이 조정 */
  padding: 0px 50px 24px 50px;

  background-color: var(--main-bg-color);
  color: var(--main-color);

  border-top: 1px solid var(--main-line-color);
  border-bottom: 1px solid var(--main-line-color);
`;

// 중간 컨텐츠 레이아웃
export const IceLayout = styled(Layout)`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  flex: 1; /* 중간 컨텐츠 레이아웃이 남은 공간을 차지하도록 */
  overflow: hidden; /* 스크롤 숨기기 */
`;

// 왼쪽 사이드바
export const IceLeftSider = styled(Sider)`
  background-color: var(--main-bg-color) !important;
  color: var(--main-color);
  border-right: 1px solid var(--main-line-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
`;

// 중간 부분
export const IceContent = styled(Content)`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
`;

// 오른쪽 사이드바
export const IceRightSider = styled(Sider)`
  background-color: var(--main-bg-color) !important;
  color: var(--main-color);
  border-left: 1px solid var(--main-line-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
`;
