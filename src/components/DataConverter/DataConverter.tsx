'use client';

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import Collapse from '@/components/common/Collapse/Collapse';
import eventBus from '@/types/eventBus';

type ConvertMode = 'base64' | 'hex';

const DataConverter: React.FC = () => {
  const t = useTranslations();
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [mode, setMode] = useState<ConvertMode>('base64');

  const canEncode = useMemo(() => inputValue.length > 0, [inputValue]);
  const canDecode = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const normalizeBase64Input = (value: string): string | null => {
    const withoutWhitespace = value.replace(/\s+/g, '');
    const withoutDataUrlPrefix = withoutWhitespace.replace(
      /^data:.*?;base64,/i,
      ''
    );
    const base64 = withoutDataUrlPrefix.replace(/-/g, '+').replace(/_/g, '/');

    // Only allow canonical Base64 characters and '=' padding at the end.
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
      return null;
    }
    if (base64.length % 4 === 1) {
      return null;
    }
    const paddingNeeded = (4 - (base64.length % 4)) % 4;
    return base64 + '='.repeat(paddingNeeded);
  };

  // Base64 encode/decode
  const handleBase64 = (type: 'encode' | 'decode') => {
    try {
      if (type === 'encode') {
        const bytes = new TextEncoder().encode(inputValue);
        // Modern, concise conversion
        const binString = String.fromCharCode(...bytes);
        setOutputValue(window.btoa(binString));
      } else {
        const normalized = normalizeBase64Input(inputValue);
        if (!normalized) throw new Error('Invalid Base64');
        const binString = window.atob(normalized);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        setOutputValue(new TextDecoder().decode(bytes));
      }
    } catch (e) {
      showError(type === 'encode' ? 'CONVERT_ENCODE' : 'CONVERT_DECODE');
    }
  };

  // Hex encode/decode
  const handleHex = (type: 'encode' | 'decode') => {
    try {
      if (type === 'encode') {
        const hex = Array.from(new TextEncoder().encode(inputValue))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
        setOutputValue(hex.toUpperCase());
      } else {
        const cleanHex = inputValue.replace(/[^0-9a-fA-F]/g, '');
        if (cleanHex.length % 2 !== 0) throw new Error('Invalid Hex');
        const bytes = new Uint8Array(
          cleanHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
        );
        setOutputValue(new TextDecoder().decode(bytes));
      }
    } catch (e) {
      showError(type === 'encode' ? 'CONVERT_ENCODE' : 'CONVERT_DECODE');
    }
  };

  const showError = (code: string) => {
    eventBus.emit('toast', { code: `${code}_FAILED` });
    setOutputValue('');
  };

  // Unified convert handler
  const onConvert = (type: 'encode' | 'decode') => {
    if (mode === 'base64') handleBase64(type);
    if (mode === 'hex') handleHex(type);
    // URL 등 추가 가능
  };

  const swapValues = () => {
    setInputValue(outputValue);
    setOutputValue(inputValue);
  };

  const clearValues = () => {
    setInputValue('');
    setOutputValue('');
  };

  const copyOutput = async () => {
    if (!outputValue) return;
    await navigator.clipboard.writeText(outputValue);
    eventBus.emit('toast', { code: 'COPY_SUCCESS' });
  };

  return (
    <Collapse title={t('dataConverter.title')} open={false}>
      <Wrapper>
        <ModeSelector>
          {(['base64', 'hex'] as const).map((m) => (
            <ModeButton
              key={m}
              $active={mode === m}
              onClick={() => {
                setMode(m);
                setOutputValue('');
              }}
            >
              {m.toUpperCase()}
            </ModeButton>
          ))}
        </ModeSelector>

        <TextArea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={t('dataConverter.inputPlaceholder')}
          rows={4}
        />

        <ButtonRow>
          <ActionButton
            onClick={() => onConvert('encode')}
            disabled={!canEncode}
          >
            {t('dataConverter.encode')}
          </ActionButton>
          <ActionButton
            onClick={() => onConvert('decode')}
            disabled={!canDecode}
          >
            {t('dataConverter.decode')}
          </ActionButton>
          <ActionButton
            onClick={swapValues}
            disabled={!inputValue && !outputValue}
          >
            {t('dataConverter.swap')}
          </ActionButton>
          <ActionButton
            onClick={clearValues}
            disabled={!inputValue && !outputValue}
          >
            {t('dataConverter.clear')}
          </ActionButton>
        </ButtonRow>

        <OutputHeader>
          <OutputTitle>{t('dataConverter.output')}</OutputTitle>
          <CopyButton onClick={copyOutput} disabled={!outputValue}>
            {t('common.copy')}
          </CopyButton>
        </OutputHeader>

        <OutputArea aria-live="polite">
          {outputValue || t('common.noData')}
        </OutputArea>
      </Wrapper>
    </Collapse>
  );
};
const ModeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${(props) =>
    props.$active ? 'var(--ice-main-color)' : 'var(--main-color-reverse)'};
  border-bottom: 2px solid
    ${(props) => (props.$active ? 'var(--ice-main-color)' : 'transparent')};
  padding: 2px 4px;
  background: transparent;
  cursor: pointer;
  border-top: none;
  border-left: none;
  border-right: none;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OutputTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--main-color);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  padding: 8px;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: transparent;
  color: var(--main-color);
  font-size: 0.7rem;
  line-height: 1.5;
  resize: vertical;

  &::placeholder {
    color: var(--main-color-reverse);
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: var(--ice-main-color);
  }
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 4px 6px;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: transparent;
  color: var(--main-color);
  font-size: 0.68rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
`;

const CopyButton = styled.button`
  padding: 2px 6px;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: transparent;
  color: var(--main-color);
  font-size: 0.65rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutputArea = styled.pre`
  margin: 0;
  padding: 8px;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: transparent;
  color: var(--main-color);
  font-size: 0.68rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 72px;
  max-height: 72px;
  overflow: auto;
`;

const ErrorText = styled.div`
  color: var(--ice-main-color-error);
  font-size: 0.68rem;
  margin-top: 2px;
`;

export default React.memo(DataConverter);
