import styled from 'styled-components';

// 캔버스 컨테이너
export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: row;
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
  width: 14px;
  height: 100%;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 7px;
  margin-left: 2px;
  display: flex;
  align-items: flex-start;
  user-select: none;
  position: relative;
`;

// 스크롤바 썸
export const ScrollbarThumb = styled.div<{
  dragging: boolean;
  height: number;
  top: number;
}>`
  width: 100%;
  height: ${({ height }) => height}px;
  margin-top: ${({ top }) => top}px;
  background: #bbb;
  border-radius: 7px;
  cursor: pointer;
  opacity: 0.7;
  transition: ${({ dragging }) => (dragging ? 'none' : 'opacity 0.2s')};
`;

// 컨텍스트 메뉴
export const ContextMenu = styled.div`
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
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
  color: #222;
  background: transparent;
  font-size: 0.85rem;
  text-align: left;
  &:hover {
    background: #f0f0f0;
    color: #1976d2;
  }
`;
