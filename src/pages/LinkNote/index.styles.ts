import styled from 'styled-components';

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
      th, td {
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
  position: fixed;
  bottom: 2%;
  right: 4%;
  z-index: 1000;
  opacity: 0.5;
  transition: opacity 0.3s;
  &:hover {
    opacity: 1;
  }
`;

export const ToggleButton = styled.button<{ $isReadOnly: boolean }>`
  padding: 8px 8px;
  background-color: transparent;
  color: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.8;
  transition: opacity 0.3s;

  svg {
    stroke: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
    fill: ${({ $isReadOnly }) => ($isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ShareButton = styled.button`
  padding: 8px 8px;
  background-color: transparent;
  color: var(--ice-main-color);
  border-radius: 8px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
  opacity: 0.8;
  transition: opacity 0.3s;

  svg {
    stroke: var(--ice-main-color);
    fill: var(--ice-main-color);
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 2%;
  left: 4%;
  border: 1px solid var(--ice-main-color);
  background-color: var(--main-bg-color);
  color: var(--ice-main-color);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  opacity: ${({ $show }) => ($show ? 0.8 : 0)};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 1000;
`;

export const ErrorMessage = styled.div`
  position: fixed;
  top: 2%;
  left: 4%;
  transform: translateX(-50%);
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
    0%, 100% {
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
