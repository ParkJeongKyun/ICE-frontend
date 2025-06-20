import styled from 'styled-components';

// 캔버스 컨테이너
export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  background: var(--main-bg-color);
  position: relative;
  display: flex;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
`;

// 캔버스 영역
export const CanvasArea = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
`;

// 스타일 캔버스
export const StyledCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: text;
  pointer-events: auto;
  will-change: transform;
`;

// 가상 스크롤바
export const VirtualScrollbar = styled.div`
  width: 10px;
  height: 100%;
  background-color: transparent;
  margin-left: 2px;
  display: flex;
  align-items: flex-start;
  user-select: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`;

// 스크롤바 썸
export const ScrollbarThumb = styled.div<{
  dragging: string | boolean;
  height: number;
  top: number;
}>`
  width: 100%;
  height: ${({ height }) => height}px;
  margin-top: ${({ top }) => top}px;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  opacity: 0.7;
  transition: ${({ dragging }) =>
    dragging === 'true' || dragging === true ? 'none' : 'opacity 0.2s'};
`;

// 컨텍스트 메뉴
export const ContextMenu = styled.div`
  position: absolute;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  border-radius: 4px;
  padding: 0;
  user-select: none;
  outline: none;
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
  &:hover {
    background: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;
