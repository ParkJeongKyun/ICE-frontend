'use client';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/locales/routing';
import pako from 'pako';
import { toByteArray } from 'base64-js';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import ShareIcon from '@/components/common/Icons/ShareIcon';
import Logo from '@/components/common/Icons/Logo/Logo';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import { createNoteUrl } from '@/layouts/LinkNoteLayout/utils';
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
  FloatingButton,
  Toast,
  StatusIndicator,
  BottomBar,
  BottomBarButton,
} from '@/layouts/LinkNoteLayout/LinkNoteLayout.styles';

interface NoteData {
  c?: string;
  lm?: string;
}

const MAX_URL_LENGTH = 32000;
const SAVE_DEBOUNCE_TIME = 1500;

// ★ 전체화면 진입 아이콘
const MaximizeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

// ★ 전체화면 해제 아이콘
const MinimizeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

const EditorCore: React.FC = () => {
  const t = useTranslations('linknote');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [urlLength, setUrlLength] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // ★ 전체화면 상태
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

  // ★ 로직 개선: 마크다운 내용이 실제로 변경되었는지 감지하기 위한 Ref
  const lastSavedMarkdownRef = useRef('');
  // ★ 이벤트 캡처링을 위한 EditorArea Ref
  const editorAreaRef = useRef<HTMLElement>(null);

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
    setUrlLength(window.location.href.length);

    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');

    if (!compressedData) return { content: '', lastModified: '' };

    try {
      const decodedUrl = decodeURIComponent(compressedData);
      const compressed = toByteArray(decodedUrl);
      const jsonString = new TextDecoder().decode(pako.inflate(compressed));

      const parsedData: NoteData = JSON.parse(jsonString);

      return {
        content: parsedData.c || '',
        lastModified: parsedData.lm || '',
      };
    } catch {
      showToast(t('invalidData'));
      return { content: '', lastModified: '' };
    }
  };

  useEffect(() => {
    const { content, lastModified: lm } = getNoteDataFromUrl();
    setInitialContent(content);
    lastSavedMarkdownRef.current = content; // 초기값 세팅
    setInitialLastModified(lm);
    if (lm) setLastModified(lm);

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
          // ★ 엔진은 살려두고 로컈 파일 업로드만 차단 (URL 입력은 허용)
          [Crepe.Feature.ImageBlock]: {
            onUpload: async (_file: File) => {
              showToast(t('contentTooLongError'));
              return Promise.reject(
                'Local image upload is blocked. Use URL instead.'
              );
            },
          },
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

                // ★ 성능 개선 포인트: 내용이 동일하다면 URL 변경이나 압축 작업을 무시합니다.
                if (markdown === lastSavedMarkdownRef.current) {
                  setIsSaving(false);
                  return;
                }
                lastSavedMarkdownRef.current = markdown; // 최신 내용 기록

                const newUrl = createNoteUrl(markdown);

                if (newUrl.length > MAX_URL_LENGTH) {
                  showToast(t('contentTooLongError'));
                  setIsSaving(false);
                  return;
                }

                window.history.replaceState({}, '', newUrl);
                setUrlLength(newUrl.length);
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

  // ★ isSaving 중 탭 닫기 / 뒤로가기 시 데이터 유실 방어
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  // ★ 완벽한 방어: capture: true 로 Milkdown이 이벤트를 낚아채기 전에 강제 차단
  useEffect(() => {
    const area = editorAreaRef.current;
    if (!area) return;

    const handleNativePaste = (e: ClipboardEvent) => {
      // 1. 파일 객체 차단 (진짜 이미지 파일 복사)
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            showToast(t('contentTooLongError'));
            return;
          }
        }
      }

      // 2. Base64 텍스트 폭탄 차단 (구글 이미지 주소 복사 등 data: URI)
      const pastedText = e.clipboardData?.getData('text/plain') || '';
      const pastedHtml = e.clipboardData?.getData('text/html') || '';
      if (
        pastedText.includes('data:image/') ||
        pastedHtml.includes('data:image/')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showToast(t('contentTooLongError'));
      }
    };

    const handleNativeDrop = (e: DragEvent) => {
      // 1. 파일 객체 드래그 차단
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const hasImageFile = Array.from(e.dataTransfer.files).some((file) =>
          file.type.startsWith('image/')
        );
        if (hasImageFile) {
          e.preventDefault();
          e.stopPropagation();
          showToast(t('contentTooLongError'));
          return;
        }
      }

      // ★ 2. Base64 텍스트 폭탄 드래그 차단 (구글 이미지 껌 누르고 끌어오기 방어)
      const droppedText = e.dataTransfer?.getData('text/plain') || '';
      const droppedHtml = e.dataTransfer?.getData('text/html') || '';
      if (
        droppedText.includes('data:image/') ||
        droppedHtml.includes('data:image/')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showToast(t('contentTooLongError'));
      }
    };

    area.addEventListener('paste', handleNativePaste, { capture: true });
    area.addEventListener('drop', handleNativeDrop, { capture: true });
    return () => {
      area.removeEventListener('paste', handleNativePaste, { capture: true });
      area.removeEventListener('drop', handleNativeDrop, { capture: true });
    };
  }, [t]);

  return (
    <LayoutWrapper>
      <TopToolbar $isFullscreen={isFullscreen}>
        <ToolbarLeft>
          <ToolbarTitle>
            <Link href="/" aria-label={t('homepage')}>
              <Logo showText />
            </Link>
            {t('appName')}
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
          <Tooltip
            text={isReadOnly ? t('editMode') : t('readMode')}
            placement="bottom"
          >
            <ToggleButton
              $isReadOnly={isReadOnly}
              onClick={() => setIsReadOnly(!isReadOnly)}
            >
              {isReadOnly ? <EditIcon /> : <ReadIcon />}
              <span>{isReadOnly ? t('editMode') : t('readMode')}</span>
            </ToggleButton>
          </Tooltip>

          <Tooltip text={t('share')} placement="bottom">
            <ShareButton onClick={handleShare}>
              <ShareIcon />
              <span>{t('share')}</span>
            </ShareButton>
          </Tooltip>
        </ToolbarRight>
      </TopToolbar>

      <EditorArea ref={editorAreaRef}>
        <MainContainer>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Milkdown />
          </div>
        </MainContainer>
      </EditorArea>

      <BottomBar
        $warn={urlLength > MAX_URL_LENGTH * 0.9}
        $isFullscreen={isFullscreen}
      >
        <span>
          {urlLength > 0
            ? `${urlLength.toLocaleString()} / ${MAX_URL_LENGTH.toLocaleString()} bytes`
            : ''}
        </span>
        <Tooltip text={t('fullscreen')} placement="top">
          <BottomBarButton
            onClick={() => setIsFullscreen(true)}
            aria-label="Fullscreen"
          >
            <MaximizeIcon />
          </BottomBarButton>
        </Tooltip>
      </BottomBar>

      {/* ★ 우측 하단에 떠있는 전체화면 취소 플로팅 버튼 (isFullscreen === true 일 때만 등장) */}
      <Tooltip text={t('exitFullscreen')} placement="left">
        <FloatingButton
          $show={isFullscreen}
          onClick={() => setIsFullscreen(false)}
          aria-label="Exit Fullscreen"
        >
          <MinimizeIcon />
        </FloatingButton>
      </Tooltip>

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
