import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const SettingsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition: color 0.15s ease;

  &:hover {
    color: var(--ice-main-color);
  }
`;

export const SettingsWrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

export const SettingsPanel = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 220px;
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 6px;
  padding: 10px 12px;
  z-index: 1100;
  animation: ${fadeIn} 0.15s ease;
`;

export const SettingsPanelTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--main-color-reverse);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  & + & {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid
      color-mix(in srgb, var(--main-line-color) 40%, transparent);
  }
`;

export const SettingsSectionLabel = styled.div`
  font-size: 0.68rem;
  color: var(--main-color-reverse);
  letter-spacing: 0.04em;
  margin-bottom: 2px;
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const SettingsLabel = styled.label`
  font-size: 0.8rem;
  color: var(--main-color);
  cursor: pointer;
  user-select: none;
`;

/* Toggle switch */
export const ToggleTrack = styled.div<{ $on: boolean }>`
  width: 30px;
  height: 16px;
  border-radius: 8px;
  background: ${({ $on }) =>
    $on ? 'var(--ice-main-color)' : 'var(--main-line-color)'};
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
`;

export const ToggleThumb = styled.div<{ $on: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $on }) => ($on ? '16px' : '2px')};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
`;

/* Bytes-per-line segmented control */
export const SegmentGroup = styled.div`
  display: flex;
  gap: 2px;
`;

export const SegmentBtn = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? 'var(--ice-main-color)' : 'var(--main-bg-color)'};
  color: ${({ $active }) => ($active ? '#000' : 'var(--main-color)')};
  border: 1px solid
    ${({ $active }) =>
      $active ? 'var(--ice-main-color)' : 'var(--main-line-color)'};
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.72rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:hover {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }
`;

/* Language flag row */
export const LangFlagRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const LangFlagBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ $active }) =>
    $active
      ? 'color-mix(in srgb, var(--ice-main-color) 15%, transparent)'
      : 'var(--main-bg-color)'};
  border: 1px solid
    ${({ $active }) =>
      $active ? 'var(--ice-main-color)' : 'var(--main-line-color)'};
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 0.78rem;
  color: ${({ $active }) =>
    $active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }
`;
