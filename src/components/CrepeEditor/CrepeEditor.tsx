'use client';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import LZString from 'lz-string';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import ShareIcon from '@/components/common/Icons/ShareIcon';
import Logo from '@/components/common/Icons/Logo/Logo';
import {
  LayoutWrapper,
  TopToolbar,
  ToolbarLeft,
  ToolbarTitle,
  LogoButton,
  ToolbarStatus,
  ToolbarRight,
  EditorArea,
  MainContainer,
  ToggleButton,
  ShareButton,
  Toast,
  StatusIndicator,
} from '@/layouts/LinkNoteLayout/LinkNoteLayout.styles';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import { createNoteUrl } from '@/layouts/LinkNoteLayout/utils';

// 데이터 구조 인터페이스
interface NoteData {
  c?: string; // 내용
  lm?: string; // 마지막 수정 시간
}

const MAX_URL_LENGTH = 8000;
const SAVE_DEBOUNCE_TIME = 1500;

const EditorCore: React.FC = () => {
  const t = useTranslations('linknote');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [initialContent, setInitialContent] = useState('');
  const [initialLastModified, setInitialLastModified] = useState('');
  const editorRef = useRef<Crepe | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastModified, setLastModified] = useState<string>('');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReadOnlyRef = useRef(isReadOnly);

  // isReadOnly 상태를 ref에 동기화
  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
  }, [isReadOnly]);

  const showToast = (msg: string, duration = 3000) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), duration);
  };

  // URL에서 노트 데이터 추출 함수
  const getNoteDataFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');

    if (!compressedData) return { content: '', lastModified: '' };

    try {
      const decompressed =
        LZString.decompressFromEncodedURIComponent(compressedData);
      if (!decompressed) return { content: '', lastModified: '' };

      const data: NoteData = JSON.parse(decompressed);
      return {
        content: data.c || '',
        lastModified: data.lm || '',
      };
    } catch {
      showToast(t('invalidData'));
      return { content: '', lastModified: '' };
    }
  };

  // 마운트 시 URL에서 데이터 로드
  useEffect(() => {
    const { content, lastModified: lm } = getNoteDataFromUrl();
    setInitialContent(content);
    setInitialLastModified(lm);
    if (lm) setLastModified(lm);

    // ★ UX 매직: 전달받은 내용이 없으면 '편집 모드(Edit)'로 자동 시작!
    if (!content) {
      setIsReadOnly(false);
    }
  }, []);

  const handleShare = () => {
    const url = window.location.href;

    if (url.length > MAX_URL_LENGTH) {
      showToast(t('contentTooLong'));
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: url,
        })
        .then(() => showToast(t('shareSuccess')))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            copyToClipboard(url);
          }
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => showToast(t('copiedToClipboard')))
      .catch(() => showToast(t('copyFailed')));
  };

  const formatLastModified = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const { get } = useEditor(
    (root) => {
      const editor = new Crepe({
        root,
        defaultValue: initialContent,
        featureConfigs: {
          [Crepe.Feature.LinkTooltip]: {
            inputPlaceholder: t('urlPlaceholder'),
          },
          [Crepe.Feature.Placeholder]: {
            text: t('editorPlaceholder'),
          },
        },
      });

      // 초기 상태 설정
      editor.setReadonly(isReadOnly);
      editorRef.current = editor;

      // 이벤트 리스너 등록
      editor.on((listener) => {
        listener.updated(() => {
          if (!isReadOnlyRef.current) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (hideStatusTimeoutRef.current)
              clearTimeout(hideStatusTimeoutRef.current);
            setIsSaving(true);
            saveTimeoutRef.current = setTimeout(() => {
              try {
                const markdown = editor.getMarkdown();
                const newUrl = createNoteUrl(markdown);

                if (newUrl.length > MAX_URL_LENGTH) {
                  showToast(t('contentTooLongError'));
                  setIsSaving(false);
                  return;
                }

                window.history.replaceState({}, '', newUrl);
                setLastModified(new Date().toISOString());
                hideStatusTimeoutRef.current = setTimeout(
                  () => setIsSaving(false),
                  1000
                );
              } catch {
                showToast(t('saveFailed'));
                setIsSaving(false);
              }
            }, SAVE_DEBOUNCE_TIME);
          }
        });
      });

      return editor;
    },
    [initialContent]
  );

  // 읽기 모드 상태가 변경될 때마다 에디터 업데이트
  useEffect(() => {
    if (editorRef.current) editorRef.current.setReadonly(isReadOnly);
  }, [isReadOnly]);

  // 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (hideStatusTimeoutRef.current)
        clearTimeout(hideStatusTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <LayoutWrapper>
      {/* ICE Header */}
      <TopToolbar>
        <ToolbarLeft>
          <ToolbarTitle>
            <LogoButton onClick={() => (window.location.href = '/')}>
              <Logo showText />
            </LogoButton>
            LinkNote
          </ToolbarTitle>

          <ToolbarStatus>
            {lastModified && <span>{formatLastModified(lastModified)}</span>}
            {isSaving && !isReadOnly && (
              <StatusIndicator>
                <FlopyIcon />
              </StatusIndicator>
            )}
          </ToolbarStatus>
        </ToolbarLeft>

        <ToolbarRight>
          <ToggleButton
            $isReadOnly={isReadOnly}
            onClick={() => setIsReadOnly(!isReadOnly)}
            title={isReadOnly ? t('editMode') : t('readMode')}
          >
            {isReadOnly ? <EditIcon /> : <ReadIcon />}
            <span>{isReadOnly ? t('editMode') : t('readMode')}</span>
          </ToggleButton>

          <ShareButton onClick={handleShare} title={t('share')}>
            <ShareIcon />
            <span>{t('share')}</span>
          </ShareButton>
        </ToolbarRight>
      </TopToolbar>

      {/* 에디터 영역 */}
      <EditorArea>
        <MainContainer>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Milkdown />
          </div>
        </MainContainer>
      </EditorArea>

      {/* Toast 알림 */}
      <Toast $show={!!toastMsg}>{toastMsg}</Toast>
    </LayoutWrapper>
  );
};

export default function CrepeEditor() {
  return (
    <MilkdownProvider>
      <EditorCore />
    </MilkdownProvider>
  );
}
