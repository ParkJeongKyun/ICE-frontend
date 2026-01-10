import styled from 'styled-components';
import { isMobile } from 'react-device-detect';

// 최상위 컨테이너
export const HexViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// 캔버스 컨테이너
export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--main-bg-color);
  position: relative;
  display: flex;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  user-select: none;
  -webkit-user-select: none;

  /* 네이티브 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  
  &:focus {
    outline: none;
  }
`;

// 캔버스 영역
export const CanvasArea = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// 헤더 캔버스
export const HeaderCanvas = styled.canvas`
  display: block;
  cursor: text;
  pointer-events: auto;
  will-change: transform;
  /* GPU 가속 최적화 */
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// 스타일 캔버스
export const StyledCanvas = styled.canvas`
  flex: 1;
  display: block;
  cursor: text;
  pointer-events: auto;
  will-change: transform;
  /* GPU 가속 최적화 */
  transform: translateZ(0);
  backface-visibility: hidden;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
  
  &:focus {
    outline: none;
  }
`;

// 가상 수평 스크롤바
export const HorizontalScrollbar = styled.div`
  height: ${isMobile ? '15px' : '10px'};
  width: 100%;
  background-color: transparent;
  display: flex;
  align-items: flex-start;
  user-select: none;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
  pointer-events: all;
`;

// 수평 스크롤바 썸
export const HorizontalScrollbarThumb = styled.div.attrs<{
  $dragging: string;
  $width: number;
  $translateX: number;
}>((props) => ({
  style: {
    width: `${props.$width}px`,
    transform: `translate3d(${props.$translateX}px, 0, 0)`,
  },
}))<{ $dragging: string; $width: number; $translateX: number }>`
  position: absolute;
  left: 0;
  bottom: 0;
  height: 100%;
  background-color: var(--main-hover-line-color);
  opacity: ${(props) => (props.$dragging === 'true' ? '0.9' : '0.5')};
  cursor: pointer;
  transition: opacity 0.2s;
  will-change: transform;
  &:hover {
    opacity: 0.9;
  }
  touch-action: none;
`;

// 가상 스크롤바
export const VirtualScrollbar = styled.div`
  width: ${isMobile ? '15px' : '12px'};
  height: 100%;
  background-color: transparent;
  display: flex;
  align-items: flex-start;
  user-select: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 100;
  pointer-events: all;
`;

// 스크롤바 썸
export const ScrollbarThumb = styled.div.attrs<{
  $dragging: string;
  $height: number;
  $translateY: number;
}>((props) => ({
  style: {
    height: `${props.$height}px`,
    transform: `translate3d(0, ${props.$translateY}px, 0)`,
  },
}))<{ $dragging: string; $height: number; $translateY: number }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  background-color: var(--main-hover-line-color);
  opacity: ${(props) => (props.$dragging === 'true' ? '0.9' : '0.5')};
  cursor: pointer;
  transition: opacity 0.2s;
  will-change: transform;
  &:hover {
    opacity: 0.9;
  }
  touch-action: none;
`;

// 컨텍스트 메뉴
export const ContextMenu = styled.div`
  position: absolute;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  min-width: 120px;
  border-radius: 4px;
  padding: 0;
  user-select: none;
  outline: none;
  overflow: hidden;
`;

// 컨텍스트 메뉴 리스트
export const ContextMenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 5px 5px;
`;

// 컨텍스트 메뉴 아이템
export const ContextMenuItem = styled.li`
  padding: 2.5px 10px;
  cursor: pointer;
  color: var(--main-color);
  background: transparent;
  font-size: 0.75rem;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    background: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;
