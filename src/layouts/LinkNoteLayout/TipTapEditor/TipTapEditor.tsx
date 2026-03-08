'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { AnyExtension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/locales/routing';
import type { CompressResponse } from '@/workers/noteCompress.worker';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import ShareIcon from '@/components/common/Icons/ShareIcon';
import Logo from '@/components/common/Icons/Logo/Logo';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import Tooltip from '@/components/common/Tooltip/Tooltip';

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

const MAX_URL_LENGTH = 8000;
const SAVE_DEBOUNCE_TIME = 2000;

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

export default function TipTapEditor() {
  const t = useTranslations('linknote');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [urlLength, setUrlLength] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialContent, setInitialContent] = useState('');
  const [initialLastModified, setInitialLastModified] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastModified, setLastModified] = useState<string>('');
  const [ready, setReady] = useState(false);
  const [extensionsReady, setExtensionsReady] = useState(false);
  const extensionsRef = useRef<AnyExtension[]>([StarterKit]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReadOnlyRef = useRef(isReadOnly);
  const lastSavedMarkdownRef = useRef('');
  const editorAreaRef = useRef<HTMLElement>(null);
  const compressWorkerRef = useRef<Worker | null>(null);
  const pendingCompressIdRef = useRef<string>('');

  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
  }, [isReadOnly]);

  // ★ TipTap 확장 비동기 로드 (메인 스레드 점유 분산)
  // StarterKit은 doc 노드 등 스키마 필수 요소를 제공하므로 정적 유지
  // Markdown·Placeholder는 선택적 확장이므로 비동기 로드
  useEffect(() => {
    const loadExtensions = async () => {
      const [{ Markdown }, { default: Placeholder }] = await Promise.all([
        import('tiptap-markdown'),
        import('@tiptap/extension-placeholder'),
      ]);
      // ref에 저장 후 플래그만 변경 → 에디터 재생성 방지
      extensionsRef.current = [
        StarterKit,
        Markdown.configure({ transformCopiedText: true }),
        Placeholder.configure({ placeholder: t('editorPlaceholder') }),
      ];
      setExtensionsReady(true);
    };
    loadExtensions();
  }, []);

  // ★ 압축 워커 초기화 및 정리
  useEffect(() => {
    const worker = new Worker(
      new URL('../../../workers/noteCompress.worker.ts', import.meta.url)
    );
    worker.onmessage = (e: MessageEvent<CompressResponse>) => {
      const { id, url, lastModified: lm, error } = e.data;
      if (id !== pendingCompressIdRef.current) return;
      if (error || !url) {
        showToast(t('saveFailed'));
        setIsSaving(false);
        return;
      }
      if (url.length > MAX_URL_LENGTH) {
        showToast(t('contentTooLongError'));
        setIsSaving(false);
        return;
      }
      window.history.replaceState({}, '', url);
      setUrlLength(url.length);
      if (lm) setLastModified(lm);
      hideStatusTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000);
    };
    compressWorkerRef.current = worker;
    return () => {
      worker.terminate();
      compressWorkerRef.current = null;
    };
  }, []);

  // ★ URL에서 노트 데이터를 비동기로 추출 (pako/base64 지연 로드)
  useEffect(() => {
    const init = async () => {
      setUrlLength(window.location.href.length);
      const urlParams = new URLSearchParams(window.location.search);
      const compressedData = urlParams.get('data');

      if (!compressedData) {
        setIsReadOnly(false);
        setReady(true);
        return;
      }

      try {
        const [{ default: pako }, { toByteArray }] = await Promise.all([
          import('pako'),
          import('base64-js'),
        ]);
        const decodedUrl = decodeURIComponent(compressedData);
        const compressed = toByteArray(decodedUrl);
        const jsonString = new TextDecoder().decode(pako.inflate(compressed));
        const parsedData: NoteData = JSON.parse(jsonString);

        const content = parsedData.c || '';
        const lm = parsedData.lm || '';

        setInitialContent(content);
        lastSavedMarkdownRef.current = content;
        setInitialLastModified(lm);
        if (lm) setLastModified(lm);
        if (!content) setIsReadOnly(false);
      } catch {
        showToast(t('invalidData'));
        setIsReadOnly(false);
      }
      setReady(true);
    };
    init();
  }, []);

  const showToast = (msg: string, duration = 3000) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), duration);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (url.length > MAX_URL_LENGTH) {
      showToast(t('contentTooLong'));
      return;
    }
    if (navigator.share) {
      navigator
        .share({ title: t('shareTitle'), text: t('shareText'), url })
        .then(() => showToast(t('shareSuccess')))
        .catch((error) => {
          if (error.name !== 'AbortError') copyToClipboard(url);
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

  const triggerSave = (markdown: string) => {
    if (markdown === lastSavedMarkdownRef.current) {
      setIsSaving(false);
      return;
    }
    lastSavedMarkdownRef.current = markdown;

    if (!compressWorkerRef.current) {
      setIsSaving(false);
      return;
    }
    const jobId = String(Date.now());
    pendingCompressIdRef.current = jobId;
    compressWorkerRef.current.postMessage({
      id: jobId,
      content: markdown,
      origin: window.location.origin,
      pathname: window.location.pathname,
    });
  };

  const editor = useEditor(
    {
      extensions: extensionsRef.current,
      immediatelyRender: false,
      content: initialContent,
      editable: !isReadOnly,
      editorProps: {
        attributes: {
          'aria-label': t('editorLabel'),
          'aria-multiline': 'true',
          spellcheck: 'false',
          autocorrect: 'off',
          autocapitalize: 'off',
        },
      },
      onUpdate: ({ editor: e }) => {
        if (isReadOnlyRef.current) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        if (hideStatusTimeoutRef.current)
          clearTimeout(hideStatusTimeoutRef.current);

        setIsSaving(true);

        saveTimeoutRef.current = setTimeout(() => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markdown = (
              e.storage as any
            ).markdown.getMarkdown() as string;
            triggerSave(markdown);
          } catch {
            showToast(t('saveFailed'));
            setIsSaving(false);
          }
        }, SAVE_DEBOUNCE_TIME);
      },
    },
    // URL 파싱 + 확장 로드가 모두 완료된 시점에 단 1회 에디터 생성
    [ready && extensionsReady, initialContent]
  );

  // ★ 읽기/쓰기 모드 전환 시 에디터 editable 상태 동기화
  useEffect(() => {
    if (editor) editor.setEditable(!isReadOnly);
  }, [isReadOnly, editor]);

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

  // ★ 이미지 붙여넣기·드래그 차단
  useEffect(() => {
    const area = editorAreaRef.current;
    if (!area) return;

    const handleNativePaste = (e: ClipboardEvent) => {
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

  // ★ 정리
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
              aria-label={isReadOnly ? t('editMode') : t('readMode')}
            >
              {isReadOnly ? <EditIcon /> : <ReadIcon />}
              <span aria-hidden="true">
                {isReadOnly ? t('editMode') : t('readMode')}
              </span>
            </ToggleButton>
          </Tooltip>

          <Tooltip text={t('share')} placement="bottom">
            <ShareButton onClick={handleShare} aria-label={t('share')}>
              <ShareIcon />
              <span aria-hidden="true">{t('share')}</span>
            </ShareButton>
          </Tooltip>
        </ToolbarRight>
      </TopToolbar>

      <EditorArea ref={editorAreaRef}>
        <MainContainer
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          suppressContentEditableWarning={true}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <EditorContent editor={editor} />
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
            aria-label={t('fullscreen')}
          >
            <MaximizeIcon />
          </BottomBarButton>
        </Tooltip>
      </BottomBar>

      <Tooltip text={t('exitFullscreen')} placement="left">
        <FloatingButton
          $show={isFullscreen}
          onClick={() => setIsFullscreen(false)}
          aria-label={t('exitFullscreen')}
        >
          <MinimizeIcon />
        </FloatingButton>
      </Tooltip>

      <Toast $show={!!toastMsg}>{toastMsg}</Toast>
    </LayoutWrapper>
  );
}
