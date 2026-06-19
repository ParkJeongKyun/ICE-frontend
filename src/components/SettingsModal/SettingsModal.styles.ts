import styled from 'styled-components';

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

  &:hover {
    color: var(--ice-main-color);
  }
`;

export const SettingsWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

export const SettingsPanel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  max-width: 800px;
  max-height: 85vh;
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 2px 10px var(--ice-shadow-deep);
  display: flex;
  flex-direction: column;
  z-index: 1101;
`;

export const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  padding: 2px 8px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const SettingsTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const CloseBtn = styled.div`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  padding: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border-radius: 3px;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const SettingsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

export const SettingsSectionLabel = styled.div`
  font-size: 0.68rem;
  color: var(--main-color-reverse);
  letter-spacing: 0.04em;
  font-weight: 600;
  margin-bottom: 2px;
`;

export const SettingsSectionNote = styled.div`
  font-size: 0.65rem;
  color: var(--main-color-reverse);
  opacity: 0.8;
  margin-top: 4px;
  line-height: 1.4;
`;

export const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--main-line-color);
  padding-top: 5px;
  & + & {
    margin-top: 8px;
  }
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
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

  &:hover {
    filter: brightness(1.1);
  }
`;

export const ToggleThumb = styled.div<{ $on: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $on }) => ($on ? '16px' : '2px')};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ice-icon-color);
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
  color: ${({ $active }) =>
    $active ? 'var(--main-line-color)' : 'var(--main-color)'};
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
  user-select: none;
`;

export const LangFlagBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid
    ${({ $active }) =>
      $active ? 'var(--ice-main-color)' : 'var(--main-line-color)'};
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 0.78rem;
  color: ${({ $active }) =>
    $active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  cursor: pointer;

  &:hover {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }
`;

/* Report section */
export const ReportSection = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--main-line-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const ReportLink = styled.a`
  font-size: 0.68rem;
  color: var(--ice-main-color);
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--ice-main-color) 10%, transparent);
    text-decoration: underline;
  }
`;

export const SponsorLink = styled.a`
  font-size: 0.68rem;
  color: var(--ice-main-color-love);
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--ice-main-color-love) 10%, transparent);
    text-decoration: underline;
  }
`;

export const SelectWrapper = styled.div`
  padding: 0;
  border-radius: 3px;
  border: 1px solid var(--main-line-color);
  background: var(--main-bg-color);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  background: transparent;
  border: none;
  color: var(--main-color);
  font-size: 0.75rem;
  cursor: pointer;
  outline: none;
  padding: 4px 6px;
`;

export const ResetButton = styled.button`
  width: 100%;
  padding: 6px 8px;
  border-radius: 3px;
  border: 1px solid var(--ice-main-color-error);
  background: transparent;
  color: var(--ice-main-color-error);
  font-size: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    background-color: var(--main-hover-color);
    border-color: var(--ice-border-love);
    background: var(--ice-bg-love);
  }
`;

export const DeleteCacheBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  opacity: 0.6;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    color: var(--ice-main-color-error);
    background-color: var(--main-hover-color);
  }
`;
