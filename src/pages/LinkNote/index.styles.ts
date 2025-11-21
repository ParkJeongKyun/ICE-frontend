import styled, { css } from 'styled-components';

const ButtonBase = css`
  padding: 8px 8px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.3s, transform 0.2s;
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
  transition: opacity 0.18s, visibility 0.18s;

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

export const ToggleButton = styled.button<{ $isReadOnly: boolean }>`
  ${ButtonBase}
  color: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};

  svg {
    stroke: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
    fill: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
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

export const ShareButton = styled.button`
  ${ButtonBase}
  color: var(--ice-main-color);
  margin-left: 8px;

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
  transition: opacity 0.18s, visibility 0.18s;
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
