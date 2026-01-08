import styled from 'styled-components';

export const NavigatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 100%;
  
  @media (max-width: 768px) {
    gap: 4px;
    padding: 0 8px;
  }
`;

export const NavigatorLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ice-text-color);
  white-space: nowrap;
`;

export const NavigatorInput = styled.input`
  width: 120px;
  padding: 4px 8px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
  background: var(--ice-bg-secondary);
  color: var(--ice-text-color);
  border: 1px solid var(--ice-border-color);
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--ice-main-color);
    box-shadow: 0 0 0 2px rgba(var(--ice-main-color-rgb), 0.1);
  }

  &::placeholder {
    color: var(--ice-text-secondary);
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    width: 90px;
    padding: 3px 6px;
    font-size: 0.8rem;
  }
`;

export const NavigatorButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--ice-bg-secondary);
  color: var(--ice-text-color);
  border: 1px solid var(--ice-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ice-bg-hover);
    border-color: var(--ice-main-color);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    opacity: 0.8;
  }

  &:hover svg {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;
