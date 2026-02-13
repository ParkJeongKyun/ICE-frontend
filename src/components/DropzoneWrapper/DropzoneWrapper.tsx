'use client';

import React, { useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import PaperclipIcon from '@/components/common/Icons/PaperclipIcon';
import {
  DropzoneRoot,
  DragOverlay,
  DragIconContainer,
  DragMessage,
} from './DropzoneWrapper.styles';

interface DropzoneWrapperProps {
  children: React.ReactNode;
}

const DropzoneWrapper: React.FC<DropzoneWrapperProps> = ({ children }) => {
  const t = useTranslations();
  const { processFile } = useFileProcessor();
  const { isAnalysisProcessing } = useProcess();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [forceHide, setForceHide] = useState(false);

  // 드래그 오버레이 강제 닫기 (UI 멈춤 방지)
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForceHide(true);
    setIsDropping(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // 잠시 후 다시 활성화
    setTimeout(() => setForceHide(false), 100);
  };

  // 🎯 Dropzone 설정: 파일 드롭 시 useFileProcessor로 처리
  // ⚠️ 분석 중일 때는 드롭 비활성화 (WASM 워커는 순차 실행만 가능)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (isDropping) return; // 이미 처리 중이면 무시

      setIsDropping(true);
      try {
        // 여러 파일 드롭해도 첫 번째 파일만 처리 (WASM 충돌 방지)
        if (acceptedFiles.length > 0) {
          await processFile(acceptedFiles[0]);
        }
      } catch (error) {
        console.error('[DropzoneWrapper] File processing error:', error);
      } finally {
        // 에러가 발생해도 input은 반드시 초기화 (상태 꼬임 방지)
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setIsDropping(false);
      }
    },
    disabled: isAnalysisProcessing || isDropping, // 처리 중에는 드롭 불가
    noClick: true, // 클릭으로는 파일 선택 안 되도록 (기존 Open 버튼 사용)
    noKeyboard: true,
  });

  return (
    <DropzoneRoot {...getRootProps()}>
      <input {...getInputProps()} ref={inputRef} />
      {isDragActive && !forceHide && (
        <DragOverlay onClick={handleOverlayClick}>
          <DragIconContainer>
            <PaperclipIcon width={40} height={40} />
          </DragIconContainer>
          <DragMessage>{t('dropzone.message')}</DragMessage>
        </DragOverlay>
      )}
      {children}
    </DropzoneRoot>
  );
};

export default DropzoneWrapper;
