import styled, { css } from 'styled-components';

const ButtonBase = css`
  padding: 8px 8px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    opacity 0.3s,
    transform 0.2s;
  opacity: 0.8;
  position: relative;
  font-family: monospace;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const TooltipBase = css`
  font-family: monospace;
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  z-index: 2000;
  pointer-events: none;
  background: var(--main-bg-color);
  color: var(--ice-main-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.18s,
    visibility 0.18s;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: var(--main-bg-color) transparent transparent transparent;
    display: block;
  }
`;

export const MainContainer = styled.div`
  .milkdown {
    /* Font Families */
    --crepe-font-title: monospace;
    --crepe-font-default: monospace;
    --crepe-font-code: monospace;
    .editor {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      p {
        margin: 0;
        line-height: 1;
      }
      li {
        margin: 0;
        gap: 0.25rem;
      }
      /* ▼ li > p가 모바일에서 튀어나오는 현상 완화 */
      li > p {
        margin: 0 !important;
        padding: 0 !important;
        display: inline;
      }
      th,
      td {
        padding: 0.25em;
      }
      .list-item {
        align-items: center;
      }
      .paragraph {
        margin: 1rem 0;
      }
      .heading {
        font-weight: 600;
        margin: 1.5rem 0 1rem;
      }
      .bullet-list {
        padding-left: 1.5rem;
      }
      .ordered-list {
        padding-left: 1.5rem;
      }
      .milkdown-code-block {
        padding: 0;
      }
    }
  }
`;

export const ButtonZone = styled.div`
  font-family: monospace;
  position: fixed;
  bottom: 2%;
  right: 4%;
  z-index: 1000;
  opacity: 0.5;
  transition: opacity 0.3s;
  &:hover {
    opacity: 1;
  }
  .btn-tooltip-wrap {
    position: relative;
    display: inline-block;
  }
`;

export const ToggleButton = styled.button<{
  $isReadOnly: boolean;
  $pulse?: boolean;
}>`
  ${ButtonBase}
  color: ${({ $isReadOnly }) =>
    $isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)'};
  ${({ $pulse }) => $pulse && pulse}

  svg {
    stroke: ${({ $isReadOnly }) =>
      $isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)'};
    fill: ${({ $isReadOnly }) =>
      $isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)'};
  }

  &:hover .btn-tooltip,
  &:focus .btn-tooltip,
  &:active .btn-tooltip {
    opacity: 1;
    visibility: visible;
    pointer-events: none;
  }

  .btn-tooltip {
    ${TooltipBase}
  }
`;

export const ShareButton = styled.button<{ $pulse?: boolean }>`
  ${ButtonBase}
  color: var(--ice-main-color);
  margin-left: 8px;
  ${({ $pulse }) => $pulse && pulse}

  svg {
    stroke: var(--ice-main-color);
    fill: var(--ice-main-color);
  }

  &:hover .btn-tooltip,
  &:focus .btn-tooltip,
  &:active .btn-tooltip {
    opacity: 1;
    visibility: visible;
    pointer-events: none;
  }

  .btn-tooltip {
    ${TooltipBase}
  }
`;

export const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 2%;
  left: 4%;
  font-size: 1rem;
  font-family: monospace;
  background: var(--main-bg-color);
  color: var(--ice-main-color);
  padding: 0.25rem 0.7rem;
  border-radius: 8px;
  opacity: ${({ $show }) => ($show ? 0.95 : 0)};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition:
    opacity 0.18s,
    visibility 0.18s;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const ErrorMessage = styled.div`
  position: fixed;
  font-size: 1rem;
  font-family: monospace;
  top: 2%;
  left: 4%;
  border: 1px solid var(--ice-main-color_1);
  background-color: var(--main-bg-color);
  color: var(--ice-main-color_1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  z-index: 1001;
`;

export const StatusIndicator = styled.div<{ $saving: boolean }>`
  position: fixed;
  top: 2%;
  right: 4%;
  z-index: 999;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
    color: var(--ice-main-color);
    opacity: 0.15;
    transition: opacity 0.3s ease;
    ${({ $saving }) =>
      $saving &&
      `
      opacity: 0.45;
      animation: subtlePulse 3s ease-in-out infinite;
    `}
  }

  @keyframes subtlePulse {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(0.98);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.01);
    }
  }
`;

export const LastModifiedTime = styled.div`
  position: fixed;
  bottom: 2%;
  left: 4%;
  font-size: 0.8rem;
  color: var(--main-color_1);
  padding: 0;
  z-index: 999;
  opacity: 0.4;
  font-weight: 400;
  transition: opacity 0.3s;
  &:hover {
    opacity: 1;
  }
`;

export const GuideBox = styled.div`
  position: fixed;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  padding: 1.2rem 1rem 1.3rem 1rem;
  color: var(--ice-main-color_2);
  border-radius: 10px;
  font-family: monospace;
  font-size: 1.02rem;
  text-align: left;
  opacity: 0.96;
  border: 1.5px dashed var(--ice-main-color_2);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  z-index: 2001;

  b {
    color: var(--ice-main-color);
    font-weight: 700;
    font-size: 0.9rem;
  }

  ul {
    margin: 0.7em 0 0 1.2em;
    padding: 0;
    font-size: 0.9rem;
    li {
      margin-bottom: 0.25em;
      line-height: 1.7;
      &::marker {
        color: var(--ice-main-color_2);
      }
    }
  }
`;

// 버튼 강조 애니메이션
export const pulse = css`
  animation: pulseBtn 4s cubic-bezier(0.4, 0, 0.6, 1) 100;
  @keyframes pulseBtn {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 180, 255, 0.25);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(0, 180, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 180, 255, 0);
    }
  }
`;
